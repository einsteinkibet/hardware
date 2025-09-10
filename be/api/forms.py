# api/forms.py
from django import forms
from .models import Category, Supplier, Tag, Product, ProductImage, Inventory, Customer, Order, Payment, Discount, Return

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'description', 'parent', 'image']

class SupplierForm(forms.ModelForm):
    class Meta:
        model = Supplier
        fields = ['name', 'contact_person', 'email', 'phone', 'address', 'is_active']

class TagForm(forms.ModelForm):
    class Meta:
        model = Tag
        fields = ['name', 'color']

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['name', 'description', 'category', 'supplier', 'sku', 'barcode', 
                 'price', 'cost_price', 'min_stock_level', 'is_active', 'tags']

class ProductImageForm(forms.ModelForm):
    class Meta:
        model = ProductImage
        fields = ['image', 'is_primary', 'caption']

class InventoryForm(forms.ModelForm):
    class Meta:
        model = Inventory
        fields = ['quantity', 'location']

class InventoryAdjustmentForm(forms.Form):
    ADJUSTMENT_CHOICES = (
        ('add', 'Add Stock'),
        ('subtract', 'Subtract Stock'),
    )
    
    adjustment_type = forms.ChoiceField(choices=ADJUSTMENT_CHOICES)
    quantity = forms.IntegerField(min_value=1)
    reason = forms.CharField(required=False)

class CustomerForm(forms.ModelForm):
    class Meta:
        model = Customer
        fields = ['phone', 'address', 'credit_limit', 'is_approved']

class CustomerBalanceForm(forms.Form):
    amount = forms.DecimalField(max_digits=10, decimal_places=2)
    description = forms.CharField(required=False)

class AddToCartForm(forms.Form):
    quantity = forms.IntegerField(min_value=1, initial=1)

class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = ['status', 'payment_status', 'notes']

class PaymentForm(forms.ModelForm):
    class Meta:
        model = Payment
        fields = ['amount', 'method', 'reference']

class DiscountForm(forms.ModelForm):
    class Meta:
        model = Discount
        fields = ['code', 'name', 'description', 'discount_type', 'value', 
                 'min_order_amount', 'max_discount', 'start_date', 'end_date', 
                 'is_active', 'usage_limit', 'products', 'categories']

class ReturnForm(forms.ModelForm):
    class Meta:
        model = Return
        fields = ['product', 'quantity', 'reason', 'notes', 'refund_amount']