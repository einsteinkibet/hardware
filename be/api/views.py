# views.py
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from .models import Category, Product, Inventory
from .forms import CategoryForm
# Add to the top of views.py
from django.db import models
from django.core.cache import cache
from django.conf import settings
from .utils.sms_utils import send_sms
from .utils.export_utils import export_to_excel, export_to_pdf
from rest_framework import generics

# api/views_auth.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from .models import Customer
import json
from .serializers import ExpenseSerializer

@api_view(['POST'])
@permission_classes([AllowAny])
def api_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                'success': True,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff
                }
            })
        else:
            return Response({
                'success': False,
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_logout(request):
    logout(request)
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([AllowAny])
def api_register(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        
        if User.objects.filter(username=username).exists():
            return Response({
                'success': False,
                'error': 'Username already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create customer profile
        Customer.objects.create(user=user)
        
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_profile(request):
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff
    })
    
# Category List View
class CategoryListView(ListView):
    model = Category
    template_name = 'categories/category_list.html'
    context_object_name = 'categories'
    
    def get_queryset(self):
        return Category.objects.filter(parent__isnull=True)

# Category Create View
@login_required
@permission_required('inventory.add_category', raise_exception=True)
def category_create(request):
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES)
        if form.is_valid():
            category = form.save()
            messages.success(request, f'Category "{category.name}" created successfully.')
            return redirect('category_list')
    else:
        form = CategoryForm()
    
    return render(request, 'categories/category_form.html', {'form': form, 'title': 'Add Category'})

# Category Update View
@login_required
@permission_required('inventory.change_category', raise_exception=True)
def category_update(request, pk):
    category = get_object_or_404(Category, pk=pk)
    
    if request.method == 'POST':
        form = CategoryForm(request.POST, request.FILES, instance=category)
        if form.is_valid():
            category = form.save()
            messages.success(request, f'Category "{category.name}" updated successfully.')
            return redirect('category_list')
    else:
        form = CategoryForm(instance=category)
    
    return render(request, 'categories/category_form.html', {'form': form, 'title': 'Edit Category'})

# Category Delete View
@login_required
@permission_required('inventory.delete_category', raise_exception=True)
def category_delete(request, pk):
    category = get_object_or_404(Category, pk=pk)
    
    # Check if category has products
    if Product.objects.filter(category=category).exists():
        messages.error(request, f'Cannot delete category "{category.name}" because it has products assigned to it.')
        return redirect('category_list')
    
    if request.method == 'POST':
        category_name = category.name
        category.delete()
        messages.success(request, f'Category "{category_name}" deleted successfully.')
        return redirect('category_list')
    
    return render(request, 'categories/category_confirm_delete.html', {'category': category})


################
##########paymrnt
# api/views_payment.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Payment, Order
import json

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_list_by_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    payments = Payment.objects.filter(order=order)
    
    data = [{
        'id': payment.id,
        'amount': float(payment.amount),
        'method': payment.method,
        'reference': payment.reference,
        'created_at': payment.created_at,
        'processed_by': payment.processed_by.username if payment.processed_by else None
    } for payment in payments]
    
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_detail(request, payment_id):
    payment = get_object_or_404(Payment, id=payment_id)
    
    data = {
        'id': payment.id,
        'order_id': payment.order.id,
        'amount': float(payment.amount),
        'method': payment.method,
        'reference': payment.reference,
        'created_at': payment.created_at,
        'processed_by': payment.processed_by.username if payment.processed_by else None
    }
    
    return Response(data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_process(request):
    try:
        data = json.loads(request.body)
        order_id = data.get('order_id')
        amount = data.get('amount')
        method = data.get('method')
        reference = data.get('reference', '')
        
        order = get_object_or_404(Order, id=order_id)
        
        payment = order.add_payment(
            amount=amount,
            method=method,
            reference=reference,
            processed_by=request.user
        )
        
        return Response({
            'success': True,
            'payment_id': payment.id,
            'message': 'Payment processed successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_refund(request, payment_id):
    try:
        data = json.loads(request.body)
        amount = data.get('amount')
        
        payment = get_object_or_404(Payment, id=payment_id)
        
        # Implement refund logic here
        # This would typically create a negative payment
        refund_payment = Payment.objects.create(
            order=payment.order,
            amount=-amount,
            method=payment.method,
            reference=f"Refund for {payment.reference}",
            processed_by=request.user
        )
        
        return Response({
            'success': True,
            'refund_id': refund_payment.id,
            'message': 'Refund processed successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=400)
        

######
######supply views
# views.py (continued)
from .models import Supplier
from .forms import SupplierForm

# Supplier List View
class SupplierListView(ListView):
    model = Supplier
    template_name = 'suppliers/supplier_list.html'
    context_object_name = 'suppliers'
    paginate_by = 20

# Supplier Create View
@login_required
@permission_required('inventory.add_supplier', raise_exception=True)
def supplier_create(request):
    if request.method == 'POST':
        form = SupplierForm(request.POST)
        if form.is_valid():
            supplier = form.save()
            messages.success(request, f'Supplier "{supplier.name}" created successfully.')
            return redirect('supplier_list')
    else:
        form = SupplierForm()
    
    return render(request, 'suppliers/supplier_form.html', {'form': form, 'title': 'Add Supplier'})

# Supplier Update View
@login_required
@permission_required('inventory.change_supplier', raise_exception=True)
def supplier_update(request, pk):
    supplier = get_object_or_404(Supplier, pk=pk)
    
    if request.method == 'POST':
        form = SupplierForm(request.POST, instance=supplier)
        if form.is_valid():
            supplier = form.save()
            messages.success(request, f'Supplier "{supplier.name}" updated successfully.')
            return redirect('supplier_list')
    else:
        form = SupplierForm(instance=supplier)
    
    return render(request, 'suppliers/supplier_form.html', {'form': form, 'title': 'Edit Supplier'})

# Supplier Delete View
@login_required
@permission_required('inventory.delete_supplier', raise_exception=True)
def supplier_delete(request, pk):
    supplier = get_object_or_404(Supplier, pk=pk)
    
    # Check if supplier has products
    if Product.objects.filter(supplier=supplier).exists():
        messages.error(request, f'Cannot delete supplier "{supplier.name}" because it has products assigned to it.')
        return redirect('supplier_list')
    
    if request.method == 'POST':
        supplier_name = supplier.name
        supplier.delete()
        messages.success(request, f'Supplier "{supplier_name}" deleted successfully.')
        return redirect('supplier_list')
    
    return render(request, 'suppliers/supplier_confirm_delete.html', {'supplier': supplier})

######
#######tag views
# views.py (continued)
from .models import Tag
from .forms import TagForm

# Tag List View
class TagListView(ListView):
    model = Tag
    template_name = 'tags/tag_list.html'
    context_object_name = 'tags'
    paginate_by = 30

# Tag Create View
@login_required
@permission_required('inventory.add_tag', raise_exception=True)
def tag_create(request):
    if request.method == 'POST':
        form = TagForm(request.POST)
        if form.is_valid():
            tag = form.save()
            messages.success(request, f'Tag "{tag.name}" created successfully.')
            return redirect('tag_list')
    else:
        form = TagForm()
    
    return render(request, 'tags/tag_form.html', {'form': form, 'title': 'Add Tag'})

# Tag Update View
@login_required
@permission_required('inventory.change_tag', raise_exception=True)
def tag_update(request, pk):
    tag = get_object_or_404(Tag, pk=pk)
    
    if request.method == 'POST':
        form = TagForm(request.POST, instance=tag)
        if form.is_valid():
            tag = form.save()
            messages.success(request, f'Tag "{tag.name}" updated successfully.')
            return redirect('tag_list')
    else:
        form = TagForm(instance=tag)
    
    return render(request, 'tags/tag_form.html', {'form': form, 'title': 'Edit Tag'})

# Tag Delete View
@login_required
@permission_required('inventory.delete_tag', raise_exception=True)
def tag_delete(request, pk):
    tag = get_object_or_404(Tag, pk=pk)
    
    if request.method == 'POST':
        tag_name = tag.name
        tag.delete()
        messages.success(request, f'Tag "{tag_name}" deleted successfully.')
        return redirect('tag_list')
    
    return render(request, 'tags/tag_confirm_delete.html', {'tag': tag})

###########
###########product views
# views.py (continued)
from .models import Product, ProductImage
from .forms import ProductForm, ProductImageForm

# Product List View
class ProductListView(ListView):
    model = Product
    template_name = 'products/product_list.html'
    context_object_name = 'products'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = Product.objects.all().select_related('category', 'supplier')
        
        # Filter by category if provided
        category_id = self.request.GET.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by search query if provided
        search_query = self.request.GET.get('q')
        if search_query:
            queryset = queryset.filter(
                models.Q(name__icontains=search_query) |
                models.Q(sku__icontains=search_query) |
                models.Q(description__icontains=search_query)
            )
        
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = Category.objects.all()
        return context

# Product Detail View
def product_detail(request, pk):
    product = get_object_or_404(Product, pk=pk)
    return render(request, 'products/product_detail.html', {'product': product})

# Product Create View
@login_required
@permission_required('inventory.add_product', raise_exception=True)
def product_create(request):
    if request.method == 'POST':
        form = ProductForm(request.POST)
        if form.is_valid():
            product = form.save()
            messages.success(request, f'Product "{product.name}" created successfully.')
            return redirect('product_detail', pk=product.pk)
    else:
        form = ProductForm()
    
    return render(request, 'products/product_form.html', {'form': form, 'title': 'Add Product'})

# Product Update View
@login_required
@permission_required('inventory.change_product', raise_exception=True)
def product_update(request, pk):
    product = get_object_or_404(Product, pk=pk)
    
    if request.method == 'POST':
        form = ProductForm(request.POST, instance=product)
        if form.is_valid():
            product = form.save()
            messages.success(request, f'Product "{product.name}" updated successfully.')
            return redirect('product_detail', pk=product.pk)
    else:
        form = ProductForm(instance=product)
    
    return render(request, 'products/product_form.html', {'form': form, 'title': 'Edit Product'})

# Product Delete View
@login_required
@permission_required('inventory.delete_product', raise_exception=True)
def product_delete(request, pk):
    product = get_object_or_404(Product, pk=pk)
    
    if request.method == 'POST':
        product_name = product.name
        product.delete()
        messages.success(request, f'Product "{product_name}" deleted successfully.')
        return redirect('product_list')
    
    return render(request, 'products/product_confirm_delete.html', {'product': product})


###########
##########product image
# views.py (continued)
from django.views.decorators.http import require_POST

# Product Image Add View
@login_required
@permission_required('inventory.add_productimage', raise_exception=True)
def product_image_add(request, product_pk):
    product = get_object_or_404(Product, pk=product_pk)
    
    if request.method == 'POST':
        form = ProductImageForm(request.POST, request.FILES)
        if form.is_valid():
            image = form.save(commit=False)
            image.product = product
            image.save()
            
            if request.is_ajax():
                return JsonResponse({'success': True, 'image_id': image.pk})
            
            messages.success(request, 'Image added successfully.')
            return redirect('product_detail', pk=product.pk)
    else:
        form = ProductImageForm()
    
    return render(request, 'products/product_image_form.html', {'form': form, 'product': product})

# Product Image Delete View
@login_required
@permission_required('inventory.delete_productimage', raise_exception=True)
@require_POST
def product_image_delete(request, pk):
    image = get_object_or_404(ProductImage, pk=pk)
    product_pk = image.product.pk
    image.delete()
    
    if request.is_ajax():
        return JsonResponse({'success': True})
    
    messages.success(request, 'Image deleted successfully.')
    return redirect('product_detail', pk=product_pk)

# Set Primary Image View
@login_required
@permission_required('inventory.change_productimage', raise_exception=True)
@require_POST
def product_image_set_primary(request, pk):
    image = get_object_or_404(ProductImage, pk=pk)
    image.is_primary = True
    image.save()
    
    if request.is_ajax():
        return JsonResponse({'success': True})
    
    messages.success(request, 'Primary image set successfully.')
    return redirect('product_detail', pk=image.product.pk)

#######
########inventory views
# views.py (continued)
from .models import Inventory, InventoryHistory
from .forms import InventoryForm, InventoryAdjustmentForm

# Inventory List View
@login_required
@permission_required('inventory.view_inventory', raise_exception=True)
def inventory_list(request):
    inventories = Inventory.objects.all().select_related('product')
    
    # Filter low stock items
    low_stock = request.GET.get('low_stock')
    if low_stock:
        inventories = inventories.filter(quantity__lte=models.F('product__min_stock_level'))
    
    # Filter out of stock items
    out_of_stock = request.GET.get('out_of_stock')
    if out_of_stock:
        inventories = inventories.filter(quantity=0)
    
    return render(request, 'inventory/inventory_list.html', {
        'inventories': inventories,
        'low_stock_filter': low_stock,
        'out_of_stock_filter': out_of_stock
    })

# Inventory Update View
@login_required
@permission_required('inventory.change_inventory', raise_exception=True)
def inventory_update(request, pk):
    inventory = get_object_or_404(Inventory, pk=pk)
    
    if request.method == 'POST':
        form = InventoryForm(request.POST, instance=inventory)
        if form.is_valid():
            inventory = form.save()
            messages.success(request, f'Inventory for "{inventory.product.name}" updated successfully.')
            return redirect('inventory_list')
    else:
        form = InventoryForm(instance=inventory)
    
    return render(request, 'inventory/inventory_form.html', {'form': form, 'inventory': inventory})

# Inventory Adjustment View
@login_required
@permission_required('inventory.change_inventory', raise_exception=True)
def inventory_adjust(request, pk):
    inventory = get_object_or_404(Inventory, pk=pk)
    
    if request.method == 'POST':
        form = InventoryAdjustmentForm(request.POST)
        if form.is_valid():
            adjustment_type = form.cleaned_data['adjustment_type']
            quantity = form.cleaned_data['quantity']
            reason = form.cleaned_data['reason']
            
            if adjustment_type == 'add':
                new_quantity = inventory.quantity + quantity
            else:  # subtract
                new_quantity = max(0, inventory.quantity - quantity)
            
            inventory.adjust_stock(new_quantity, reason, request.user)
            
            messages.success(request, f'Inventory for "{inventory.product.name}" adjusted successfully.')
            return redirect('inventory_list')
    else:
        form = InventoryAdjustmentForm()
    
    return render(request, 'inventory/inventory_adjust.html', {'form': form, 'inventory': inventory})

# Inventory History View
@login_required
@permission_required('inventory.view_inventoryhistory', raise_exception=True)
def inventory_history(request, pk):
    inventory = get_object_or_404(Inventory, pk=pk)
    history = InventoryHistory.objects.filter(inventory=inventory).order_by('-changed_at')
    
    return render(request, 'inventory/inventory_history.html', {
        'inventory': inventory,
        'history': history
    })



######
#######customer view
# views.py (continued)
from .models import Customer, BalanceTransaction
from .forms import CustomerForm, CustomerBalanceForm

# Customer List View
@login_required
@permission_required('inventory.view_customer', raise_exception=True)
def customer_list(request):
    customers = Customer.objects.all().select_related('user')
    
    # Filter by search query
    search_query = request.GET.get('q')
    if search_query:
        customers = customers.filter(
            models.Q(user__first_name__icontains=search_query) |
            models.Q(user__last_name__icontains=search_query) |
            models.Q(user__username__icontains=search_query) |
            models.Q(phone__icontains=search_query)
        )
    
    return render(request, 'customers/customer_list.html', {'customers': customers})

# Customer Detail View
@login_required
@permission_required('inventory.view_customer', raise_exception=True)
def customer_detail(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    transactions = BalanceTransaction.objects.filter(customer=customer).order_by('-created_at')[:10]
    orders = Order.objects.filter(customer=customer).order_by('-created_at')[:5]
    
    return render(request, 'customers/customer_detail.html', {
        'customer': customer,
        'transactions': transactions,
        'orders': orders
    })

# Customer Create View
@login_required
@permission_required('inventory.add_customer', raise_exception=True)
def customer_create(request):
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            customer = form.save()
            messages.success(request, f'Customer "{customer}" created successfully.')
            return redirect('customer_detail', pk=customer.pk)
    else:
        form = CustomerForm()
    
    return render(request, 'customers/customer_form.html', {'form': form, 'title': 'Add Customer'})

# Customer Update View
@login_required
@permission_required('inventory.change_customer', raise_exception=True)
def customer_update(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    
    if request.method == 'POST':
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            customer = form.save()
            messages.success(request, f'Customer "{customer}" updated successfully.')
            return redirect('customer_detail', pk=customer.pk)
    else:
        form = CustomerForm(instance=customer)
    
    return render(request, 'customers/customer_form.html', {'form': form, 'title': 'Edit Customer'})

# Customer Balance Adjustment View
@login_required
@permission_required('inventory.change_customer', raise_exception=True)
def customer_balance_adjust(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    
    if request.method == 'POST':
        form = CustomerBalanceForm(request.POST)
        if form.is_valid():
            amount = form.cleaned_data['amount']
            description = form.cleaned_data['description']
            
            customer.update_balance(amount, description)
            
            messages.success(request, f'Balance for "{customer}" adjusted successfully.')
            return redirect('customer_detail', pk=customer.pk)
    else:
        form = CustomerBalanceForm()
    
    return render(request, 'customers/customer_balance_adjust.html', {'form': form, 'customer': customer})


#######
#########customer views
# views.py (continued)
from .models import Customer, BalanceTransaction
from .forms import CustomerForm, CustomerBalanceForm

# Customer List View
@login_required
@permission_required('inventory.view_customer', raise_exception=True)
def customer_list(request):
    customers = Customer.objects.all().select_related('user')
    
    # Filter by search query
    search_query = request.GET.get('q')
    if search_query:
        customers = customers.filter(
            models.Q(user__first_name__icontains=search_query) |
            models.Q(user__last_name__icontains=search_query) |
            models.Q(user__username__icontains=search_query) |
            models.Q(phone__icontains=search_query)
        )
    
    return render(request, 'customers/customer_list.html', {'customers': customers})

# Customer Detail View
@login_required
@permission_required('inventory.view_customer', raise_exception=True)
def customer_detail(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    transactions = BalanceTransaction.objects.filter(customer=customer).order_by('-created_at')[:10]
    orders = Order.objects.filter(customer=customer).order_by('-created_at')[:5]
    
    return render(request, 'customers/customer_detail.html', {
        'customer': customer,
        'transactions': transactions,
        'orders': orders
    })

# Customer Create View
@login_required
@permission_required('inventory.add_customer', raise_exception=True)
def customer_create(request):
    if request.method == 'POST':
        form = CustomerForm(request.POST)
        if form.is_valid():
            customer = form.save()
            messages.success(request, f'Customer "{customer}" created successfully.')
            return redirect('customer_detail', pk=customer.pk)
    else:
        form = CustomerForm()
    
    return render(request, 'customers/customer_form.html', {'form': form, 'title': 'Add Customer'})

# Customer Update View
@login_required
@permission_required('inventory.change_customer', raise_exception=True)
def customer_update(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    
    if request.method == 'POST':
        form = CustomerForm(request.POST, instance=customer)
        if form.is_valid():
            customer = form.save()
            messages.success(request, f'Customer "{customer}" updated successfully.')
            return redirect('customer_detail', pk=customer.pk)
    else:
        form = CustomerForm(instance=customer)
    
    return render(request, 'customers/customer_form.html', {'form': form, 'title': 'Edit Customer'})

# Customer Balance Adjustment View
@login_required
@permission_required('inventory.change_customer', raise_exception=True)
def customer_balance_adjust(request, pk):
    customer = get_object_or_404(Customer, pk=pk)
    
    if request.method == 'POST':
        form = CustomerBalanceForm(request.POST)
        if form.is_valid():
            amount = form.cleaned_data['amount']
            description = form.cleaned_data['description']
            
            customer.update_balance(amount, description)
            
            messages.success(request, f'Balance for "{customer}" adjusted successfully.')
            return redirect('customer_detail', pk=customer.pk)
    else:
        form = CustomerBalanceForm()
    
    return render(request, 'customers/customer_balance_adjust.html', {'form': form, 'customer': customer})

#########
########## cart views
# views.py (continued)
from .models import Cart, CartItem
from .forms import AddToCartForm

# View Cart
def view_cart(request):
    if request.user.is_authenticated and hasattr(request.user, 'customer'):
        cart, created = Cart.objects.get_or_create(
            customer=request.user.customer,
            is_active=True
        )
    else:
        # For anonymous users, we'd use session-based cart
        # This is a simplified implementation
        cart = None
    
    return render(request, 'cart/cart_detail.html', {'cart': cart})

# Add to Cart
@login_required
def add_to_cart(request, product_pk):
    product = get_object_or_404(Product, pk=product_pk)
    
    if not hasattr(request.user, 'customer'):
        messages.error(request, 'You need a customer account to add items to cart.')
        return redirect('product_detail', pk=product_pk)
    
    cart, created = Cart.objects.get_or_create(
        customer=request.user.customer,
        is_active=True
    )
    
    if request.method == 'POST':
        form = AddToCartForm(request.POST)
        if form.is_valid():
            quantity = form.cleaned_data['quantity']
            cart.add_item(product, quantity)
            messages.success(request, f'Added {quantity} {product.name} to cart.')
            return redirect('view_cart')
    else:
        form = AddToCartForm(initial={'quantity': 1})
    
    return render(request, 'cart/add_to_cart.html', {'form': form, 'product': product})

# Update Cart Item
@login_required
def update_cart_item(request, item_pk):
    cart_item = get_object_or_404(CartItem, pk=item_pk)
    
    # Verify the cart item belongs to the current user
    if cart_item.cart.customer != request.user.customer:
        messages.error(request, 'You cannot modify this cart item.')
        return redirect('view_cart')
    
    if request.method == 'POST':
        form = AddToCartForm(request.POST)
        if form.is_valid():
            quantity = form.cleaned_data['quantity']
            cart_item.cart.update_item_quantity(cart_item.product, quantity)
            messages.success(request, 'Cart updated successfully.')
    
    return redirect('view_cart')

# Remove from Cart
@login_required
def remove_from_cart(request, item_pk):
    cart_item = get_object_or_404(CartItem, pk=item_pk)
    
    # Verify the cart item belongs to the current user
    if cart_item.cart.customer != request.user.customer:
        messages.error(request, 'You cannot modify this cart item.')
        return redirect('view_cart')
    
    cart_item.cart.remove_item(cart_item.product)
    messages.success(request, 'Item removed from cart.')
    
    return redirect('view_cart')

# Clear Cart
@login_required
def clear_cart(request):
    if hasattr(request.user, 'customer'):
        try:
            cart = Cart.objects.get(customer=request.user.customer, is_active=True)
            cart.clear()
            messages.success(request, 'Cart cleared successfully.')
        except Cart.DoesNotExist:
            pass
    
    return redirect('view_cart')

############
###########order views
# views.py (continued)
from .models import Order, OrderItem
from .forms import OrderForm, PaymentForm

# Order List View
@login_required
@permission_required('inventory.view_order', raise_exception=True)
def order_list(request):
    orders = Order.objects.all().select_related('customer__user').order_by('-created_at')
    
    # Filter by status
    status = request.GET.get('status')
    if status:
        orders = orders.filter(status=status)
    
    # Filter by payment status
    payment_status = request.GET.get('payment_status')
    if payment_status:
        orders = orders.filter(payment_status=payment_status)
    
    return render(request, 'orders/order_list.html', {'orders': orders})

# Order Detail View
@login_required
@permission_required('inventory.view_order', raise_exception=True)
def order_detail(request, pk):
    order = get_object_or_404(Order, pk=pk)
    return render(request, 'orders/order_detail.html', {'order': order})

# Checkout Process
@login_required
def checkout(request):
    if not hasattr(request.user, 'customer'):
        messages.error(request, 'You need a customer account to checkout.')
        return redirect('view_cart')
    
    try:
        cart = Cart.objects.get(customer=request.user.customer, is_active=True)
    except Cart.DoesNotExist:
        messages.error(request, 'Your cart is empty.')
        return redirect('product_list')
    
    if request.method == 'POST':
        order = cart.checkout()
        if order:
            messages.success(request, f'Order #{order.order_number} created successfully.')
            return redirect('order_detail', pk=order.pk)
        else:
            messages.error(request, 'Failed to create order. Your cart might be empty.')
    
    return render(request, 'orders/checkout.html', {'cart': cart})

# Update Order Status
@login_required
@permission_required('inventory.change_order', raise_exception=True)
def order_update_status(request, pk):
    order = get_object_or_404(Order, pk=pk)
    
    if request.method == 'POST':
        new_status = request.POST.get('status')
        if new_status in dict(Order.ORDER_STATUS).keys():
            order.status = new_status
            order.save()
            messages.success(request, f'Order status updated to {new_status}.')
    
    return redirect('order_detail', pk=order.pk)

# Add Payment to Order
@login_required
@permission_required('inventory.add_payment', raise_exception=True)
def order_add_payment(request, pk):
    order = get_object_or_404(Order, pk=pk)
    
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        if form.is_valid():
            amount = form.cleaned_data['amount']
            method = form.cleaned_data['method']
            reference = form.cleaned_data.get('reference', '')
            
            order.add_payment(amount, method, reference, request.user)
            messages.success(request, f'Payment of ${amount} added to order.')
            return redirect('order_detail', pk=order.pk)
    else:
        form = PaymentForm()
    
    return render(request, 'orders/add_payment.html', {'form': form, 'order': order})

# Generate Receipt
@login_required
@permission_required('inventory.view_order', raise_exception=True)
def generate_receipt(request, pk):
    order = get_object_or_404(Order, pk=pk)
    receipt_data = order.generate_receipt()
    
    # In a real implementation, you would generate a PDF here
    # For now, we'll just render an HTML receipt
    return render(request, 'orders/receipt.html', {'receipt': receipt_data})

########
##########payment, debt and notification and audit logs
# views.py (continued)
from .models import Debt, Notification, AuditLog

# Debt List View
@login_required
@permission_required('inventory.view_debt', raise_exception=True)
def debt_list(request):
    debts = Debt.objects.filter(is_settled=False).select_related('customer__user', 'order')
    return render(request, 'debts/debt_list.html', {'debts': debts})

# Debt Detail View
@login_required
@permission_required('inventory.view_debt', raise_exception=True)
def debt_detail(request, pk):
    debt = get_object_or_404(Debt, pk=pk)
    return render(request, 'debts/debt_detail.html', {'debt': debt})

# Notification List View
@login_required
def notification_list(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    unread_count = notifications.filter(is_read=False).count()
    
    return render(request, 'notifications/notification_list.html', {
        'notifications': notifications,
        'unread_count': unread_count
    })

# Mark Notification as Read
@login_required
@require_POST
def notification_mark_read(request, pk):
    notification = get_object_or_404(Notification, pk=pk, user=request.user)
    notification.mark_as_read()
    
    if request.is_ajax():
        return JsonResponse({'success': True})
    
    return redirect('notification_list')

# Mark All Notifications as Read
@login_required
@require_POST
def notification_mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    
    if request.is_ajax():
        return JsonResponse({'success': True})
    
    return redirect('notification_list')

# Audit Log View
@login_required
@permission_required('inventory.view_auditlog', raise_exception=True)
def audit_log(request):
    logs = AuditLog.objects.all().select_related('user').order_by('-timestamp')
    
    # Filter by action type
    action_type = request.GET.get('action_type')
    if action_type:
        logs = logs.filter(action=action_type)
    
    # Filter by model name
    model_name = request.GET.get('model_name')
    if model_name:
        logs = logs.filter(model_name=model_name)
    
    return render(request, 'audit/audit_log.html', {'logs': logs})


########
###############barcode view
# views.py (add these views)
from django.views.decorators.http import require_POST
import json

# Barcode Scan View
@login_required
@require_POST
def barcode_scan(request):
    try:
        data = json.loads(request.body)
        barcode = data.get('barcode')
        
        if not barcode:
            return JsonResponse({'error': 'No barcode provided'}, status=400)
        
        # Try to find product by barcode
        try:
            product = Product.objects.get(barcode=barcode)
            return JsonResponse({
                'success': True,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'sku': product.sku,
                    'price': str(product.price),
                    'stock': product.current_stock
                }
            })
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

# Barcode Associate View
@login_required
@permission_required('inventory.change_product', raise_exception=True)
@require_POST
def barcode_associate(request, product_pk):
    product = get_object_or_404(Product, pk=product_pk)
    
    try:
        data = json.loads(request.body)
        barcode = data.get('barcode')
        
        if not barcode:
            return JsonResponse({'error': 'No barcode provided'}, status=400)
        
        # Check if barcode is already used
        if Product.objects.filter(barcode=barcode).exclude(pk=product_pk).exists():
            return JsonResponse({'error': 'Barcode already associated with another product'}, status=400)
        
        product.barcode = barcode
        product.save()
        
        # Log barcode scan
        BarcodeScan.objects.create(
            product=product,
            scanned_by=request.user,
            action='association',
            barcode=barcode
        )
        
        return JsonResponse({'success': True, 'barcode': barcode})
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

#########
############   Dashboard with KPIs
# views.py (add dashboard view)
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta

@login_required
def dashboard(request):
    # Calculate date ranges
    today = timezone.now().date()
    thirty_days_ago = today - timedelta(days=30)
    
    # Sales KPIs
    total_sales = Order.objects.aggregate(total=Sum('total'))['total'] or 0
    monthly_sales = Order.objects.filter(
        created_at__gte=thirty_days_ago
    ).aggregate(total=Sum('total'))['total'] or 0
    
    # Order counts
    total_orders = Order.objects.count()
    monthly_orders = Order.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Customer counts
    total_customers = Customer.objects.count()
    new_customers = Customer.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Inventory alerts
    low_stock_items = Inventory.objects.filter(quantity__lte=models.F('product__min_stock_level')).count()
    out_of_stock_items = Inventory.objects.filter(quantity=0).count()
    
    # Recent orders
    recent_orders = Order.objects.select_related('customer__user').order_by('-created_at')[:10]
    
    # Top selling products
    top_products = Product.objects.annotate(
        total_sold=Sum('orderitem__quantity')
    ).order_by('-total_sold')[:5]
    
    # Debt summary
    total_debt = Debt.objects.filter(is_settled=False).aggregate(total=Sum('remaining_amount'))['total'] or 0
    
    context = {
        'total_sales': total_sales,
        'monthly_sales': monthly_sales,
        'total_orders': total_orders,
        'monthly_orders': monthly_orders,
        'total_customers': total_customers,
        'new_customers': new_customers,
        'low_stock_items': low_stock_items,
        'out_of_stock_items': out_of_stock_items,
        'recent_orders': recent_orders,
        'top_products': top_products,
        'total_debt': total_debt,
    }
    
    return render(request, 'dashboard/dashboard.html', context)


##############
###########dATA EXPORT UI
# views.py (add export views)
from .utils.export_utils import export_to_excel, export_to_pdf

@login_required
def export_data(request, model_name):
    if model_name == 'products':
        queryset = Product.objects.all()
        fields = ['name', 'sku', 'category__name', 'price', 'inventory__quantity']
        headers = ['Product Name', 'SKU', 'Category', 'Price', 'Stock Quantity']
        filename = 'products'
    elif model_name == 'orders':
        queryset = Order.objects.all()
        fields = ['order_number', 'customer__user__username', 'total', 'status', 'created_at']
        headers = ['Order Number', 'Customer', 'Total', 'Status', 'Date']
        filename = 'orders'
    elif model_name == 'inventory':
        queryset = Inventory.objects.all()
        fields = ['product__name', 'product__sku', 'quantity', 'product__min_stock_level']
        headers = ['Product Name', 'SKU', 'Quantity', 'Min Stock Level']
        filename = 'inventory'
    elif model_name == 'customers':
        queryset = Customer.objects.all()
        fields = ['user__username', 'user__email', 'phone', 'balance', 'credit_limit']
        headers = ['Username', 'Email', 'Phone', 'Balance', 'Credit Limit']
        filename = 'customers'
    else:
        messages.error(request, 'Invalid export type')
        return redirect('dashboard')
    
    format_type = request.GET.get('format', 'excel')
    
    if format_type == 'excel':
        return export_to_excel(queryset, filename, fields)
    elif format_type == 'pdf':
        return export_to_pdf(queryset, filename, fields, headers)
    else:
        messages.error(request, 'Invalid format type')
        return redirect('dashboard')

def help_tips(request):
    if request.user.is_authenticated:
        current_url = request.path
        tips = HelpTip.objects.filter(
            is_active=True,
            page_url=current_url
        ).order_by('order')
        return {'help_tips': tips}
    return {'help_tips': []}

##########discount
###########
# views.py - Add discount views
@login_required
@permission_required('inventory.view_discount', raise_exception=True)
def discount_list(request):
    discounts = Discount.objects.all()
    return render(request, 'discounts/discount_list.html', {'discounts': discounts})

@login_required
@permission_required('inventory.add_discount', raise_exception=True)
def discount_create(request):
    if request.method == 'POST':
        form = DiscountForm(request.POST)
        if form.is_valid():
            discount = form.save()
            messages.success(request, f'Discount "{discount.code}" created successfully.')
            return redirect('discount_list')
    else:
        form = DiscountForm()
    return render(request, 'discounts/discount_form.html', {'form': form})

###############
###########   2. Return/Refund Views
# views.py - Add return views
@login_required
@permission_required('inventory.view_return', raise_exception=True)
def return_list(request):
    returns = Return.objects.all().select_related('order', 'product')
    return render(request, 'returns/return_list.html', {'returns': returns})

@login_required
@permission_required('inventory.add_return', raise_exception=True)
def create_return(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    if request.method == 'POST':
        form = ReturnForm(request.POST)
        if form.is_valid():
            return_obj = form.save(commit=False)
            return_obj.order = order
            return_obj.created_by = request.user
            return_obj.save()
            messages.success(request, 'Return request created successfully.')
            return redirect('return_list')
    else:
        form = ReturnForm()
    return render(request, 'returns/return_form.html', {'form': form, 'order': order})

    
    from .reports import ReportService

def dashboard_view(request):
    daily = ReportService.daily_sales()
    monthly = ReportService.monthly_revenue_vs_expenses()
    debtors = ReportService.debtors_list()
    best_sellers = ReportService.best_selling()
    low_stock = ReportService.low_stock()

    return render(request, "dashboard.html", {
        "daily_sales": daily,
        "monthly": monthly,
        "debtors": debtors,
        "best_sellers": best_sellers,
        "low_stock": low_stock,
    })

###########'
###########expense

@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def expense_list(request):
    """List all expenses"""
    expenses = Expense.objects.all().order_by("-created_at")
    serializer = ExpenseSerializer(expenses, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def expense_detail(request, pk):
    """Get a single expense by ID"""
    try:
        expense = Expense.objects.get(pk=pk)
    except Expense.DoesNotExist:
        return Response({"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ExpenseSerializer(expense)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def expense_create(request):
    """Create a new expense"""
    serializer = ExpenseSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticatedOrReadOnly])
def expense_update(request, pk):
    """Update an expense"""
    try:
        expense = Expense.objects.get(pk=pk)
    except Expense.DoesNotExist:
        return Response({"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ExpenseSerializer(expense, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticatedOrReadOnly])
def expense_delete(request, pk):
    """Delete an expense"""
    try:
        expense = Expense.objects.get(pk=pk)
    except Expense.DoesNotExist:
        return Response({"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)

    expense.delete()
    return Response({"message": "Expense deleted successfully"}, status=status.HTTP_204_NO_CONTENT)