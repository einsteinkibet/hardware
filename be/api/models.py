# models.py
import uuid
import os
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from decimal import Decimal
import threading
from django.db.models.functions import TruncMonth
from django.db.models import Sum
from django.db.models import Count

from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from decimal import Decimal
import uuid
from django.core.cache import cache

# Email threading for async sending
class EmailThread(threading.Thread):
    def __init__(self, subject, html_content, recipient_list):
        self.subject = subject
        self.html_content = html_content
        self.recipient_list = recipient_list
        threading.Thread.__init__(self)

    def run(self):
        text_content = strip_tags(self.html_content)
        send_mail(
            self.subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            self.recipient_list,
            html_message=self.html_content,
            fail_silently=False,
        )

def send_async_email(subject, html_content, recipient_list):
    EmailThread(subject, html_content, recipient_list).start()

# Category model
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Clear category cache on save
        cache.delete_pattern('category_*')
        cache.delete('all_categories')
        super().save(*args, **kwargs)
    
    @classmethod
    def get_all_with_products_count(cls):
        """Get all categories with product counts (cached)"""
        cache_key = 'all_categories_with_counts'
        categories = cache.get(cache_key)
        
        if categories is None:
            categories = list(cls.objects.annotate(
                product_count=models.Count('products')
            ))
            cache.set(cache_key, categories, settings.CACHE_TTL)
        
        return categories

    def get_products_count(self):
        return self.products.count()

# Supplier model
class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

# Tag model
class Tag(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#3498db')  # Hex color
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

# Product model
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, related_name='products')
    sku = models.CharField(max_length=50, unique=True, blank=True)
    barcode = models.CharField(max_length=100, unique=True, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    min_stock_level = models.PositiveIntegerField(default=5)
    is_active = models.BooleanField(default=True)
    tags = models.ManyToManyField(Tag, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Clear product cache on save
        cache.delete_pattern('product_*')
        cache.delete('low_stock_products')
        cache.delete('all_products')
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        # Clear product cache on delete
        cache.delete_pattern('product_*')
        cache.delete('low_stock_products')
        cache.delete('all_products')
        super().delete(*args, **kwargs)
    
    @classmethod
    def get_low_stock_products(cls):
        """Get low stock products with caching"""
        cache_key = 'low_stock_products'
        products = cache.get(cache_key)
        
        if products is None:
            products = list(cls.objects.filter(
                inventory__quantity__lte=models.F('min_stock_level')
            ).select_related('inventory'))
            cache.set(cache_key, products, settings.CACHE_TTL)
        
        return products
            
    @property
    def current_stock(self):
        if hasattr(self, 'inventory'):
            return self.inventory.quantity
        return 0
    
    @property
    def in_stock(self):
        return self.current_stock > 0
    
    @property
    def needs_restock(self):
        return self.current_stock <= self.min_stock_level
    
    def check_low_stock(self):
        """Check if stock is low and send notification if needed"""
        if self.needs_restock:
            # Create notification
            notification = Notification.objects.create(
                type='low_stock',
                title=f'Low Stock Alert: {self.name}',
                message=f'Only {self.current_stock} left in stock. Minimum is {self.min_stock_level}.',
                related_object_id=self.id
            )
            
            # Send email to admins
            admins = User.objects.filter(is_staff=True)
            if admins.exists():
                subject = f'Low Stock Alert: {self.name}'
                html_message = render_to_string('emails/low_stock_alert.html', {
                    'product': self,
                    'current_stock': self.current_stock,
                    'min_stock_level': self.min_stock_level
                })
                
                recipient_list = [admin.email for admin in admins]
                send_async_email(subject, html_message, recipient_list)
            
            return True
        return False

# Product Image model
class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    caption = models.CharField(max_length=200, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'uploaded_at']
    
    def __str__(self):
        return f"Image for {self.product.name}"
    
    def save(self, *args, **kwargs):
        # If this is set as primary, ensure no other primary images for this product
        if self.is_primary:
            ProductImage.objects.filter(product=self.product, is_primary=True).update(is_primary=False)
        super().save(*args, **kwargs)

# Inventory model
class Inventory(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory')
    quantity = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=100, blank=True)
    last_restocked = models.DateTimeField(auto_now=True)
    last_audited = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name_plural = "Inventory"
    
    def __str__(self):
        return f"{self.product.name} - {self.quantity} in stock"
    
    def adjust_stock(self, quantity, reason='', user=None):
        """Adjust inventory quantity and log the change"""
        old_quantity = self.quantity
        self.quantity = quantity
        self.save()
        
        # Create inventory history record
        InventoryHistory.objects.create(
            inventory=self,
            old_quantity=old_quantity,
            new_quantity=quantity,
            difference=quantity - old_quantity,
            reason=reason,
            changed_by=user
        )
        
        # Check if stock is low after adjustment
        self.product.check_low_stock()
        
        return self

# Inventory History model
class InventoryHistory(models.Model):
    ACTION_TYPES = (
        ('restock', 'Restock'),
        ('sale', 'Sale'),
        ('adjustment', 'Adjustment'),
        ('damage', 'Damage'),
        ('return', 'Return'),
    )
    
    inventory = models.ForeignKey(Inventory, on_delete=models.CASCADE, related_name='history')
    old_quantity = models.IntegerField()
    new_quantity = models.IntegerField()
    difference = models.IntegerField()
    reason = models.CharField(max_length=200, blank=True)
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES, default='adjustment')
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Inventory History"
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.inventory.product.name}: {self.old_quantity} → {self.new_quantity}"

# Customer model
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=1000)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['user__first_name', 'user__last_name']
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"
    
    @property
    def has_available_credit(self):
        return self.balance < self.credit_limit
    
    @property
    def available_credit(self):
        return self.credit_limit - self.balance
    
    def update_balance(self, amount, description='', order=None):
        """Update customer balance and create transaction record"""
        old_balance = self.balance
        self.balance += amount
        self.save()
        
        # Create balance transaction
        BalanceTransaction.objects.create(
            customer=self,
            amount=amount,
            old_balance=old_balance,
            new_balance=self.balance,
            description=description,
            order=order
        )
        
        return self

# Balance Transaction model
class BalanceTransaction(models.Model):
    TRANSACTION_TYPES = (
        ('payment', 'Payment'),
        ('purchase', 'Purchase'),
        ('adjustment', 'Adjustment'),
        ('refund', 'Refund'),
    )
    
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='balance_transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    old_balance = models.DecimalField(max_digits=10, decimal_places=2)
    new_balance = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.CharField(max_length=200, blank=True)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES, default='payment')
    order = models.ForeignKey('Order', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.customer}: {self.amount} ({self.transaction_type})"

# Cart model
class Cart(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='carts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Cart #{self.id} - {self.customer}"
    
    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())
    
    @property
    def item_count(self):
        return self.items.count()
    
    def add_item(self, product, quantity=1):
        """Add item to cart or update quantity if already exists"""
        cart_item, created = CartItem.objects.get_or_create(
            cart=self,
            product=product,
            defaults={'quantity': quantity, 'price': product.price}
        )
        
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        
        return cart_item
    
    def remove_item(self, product):
        """Remove item from cart"""
        CartItem.objects.filter(cart=self, product=product).delete()
        return True
    
    def update_item_quantity(self, product, quantity):
        """Update item quantity in cart"""
        if quantity <= 0:
            return self.remove_item(product)
        
        try:
            cart_item = CartItem.objects.get(cart=self, product=product)
            cart_item.quantity = quantity
            cart_item.save()
            return cart_item
        except CartItem.DoesNotExist:
            return None
    
    def clear(self):
        """Remove all items from cart"""
        self.items.all().delete()
        return True
    
    def checkout(self):
        """Convert cart to order"""
        if self.item_count == 0:
            return None
        
        order = Order.objects.create(
            customer=self.customer,
            subtotal=self.total,
            total=self.total  # Initially same as subtotal, discounts applied later
        )
        
        # Move items from cart to order
        for cart_item in self.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.price
            )
        
        # Clear the cart
        self.clear()
        self.is_active = False
        self.save()
        
        return order

# Cart Item model
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Snapshot of price at time of adding
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['added_at']
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    @property
    def subtotal(self):
        return self.quantity * self.price
    
    def save(self, *args, **kwargs):
        # Ensure price is always the current product price when created
        if not self.pk:
            self.price = self.product.price
        super().save(*args, **kwargs)

# Order model
class Order(models.Model):
    ORDER_STATUS = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )
    
    PAYMENT_STATUS = (
        ('pending', 'Pending'),
        ('partial', 'Partially Paid'),
        ('paid', 'Fully Paid'),
        ('refunded', 'Refunded'),
    )
    
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.order_number} - {self.customer}"
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = str(uuid.uuid4().hex[:20]).upper()
        super().save(*args, **kwargs)
        
    @property
    def items_count(self):
        return self.items.count()
    
    @property
    def amount_paid(self):
        return sum(payment.amount for payment in self.payments.all())
    
    @property
    def amount_due(self):
        return self.total - self.amount_paid
    
    def update_payment_status(self):
        """Update payment status based on payments made"""
        amount_paid = self.amount_paid
        
        if amount_paid <= 0:
            self.payment_status = 'pending'
        elif amount_paid < self.total:
            self.payment_status = 'partial'
        else:
            self.payment_status = 'paid'
        
        self.save()
        return self.payment_status
    
    def add_payment(self, amount, method, reference='', processed_by=None):
        """Add payment to order"""
        if amount <= 0:
            return None
        
        payment = Payment.objects.create(
            order=self,
            amount=amount,
            method=method,
            reference=reference,
            processed_by=processed_by
        )
        
        # Update customer balance if payment reduces debt
        if amount > 0:
            self.customer.update_balance(
                -amount,  # Negative amount reduces debt
                f"Payment for order #{self.order_number}",
                self
            )
        
        # Update payment status
        self.update_payment_status()
        
        # If order is fully paid, update status
        if self.payment_status == 'paid' and self.status == 'pending':
            self.status = 'confirmed'
            self.save()
        
        return payment
    
    def apply_discount(self, discount_code):
        """Apply discount to order (simplified implementation)"""
        # In a real implementation, you would validate the discount code
        # and calculate the discount amount based on rules
        self.discount = self.subtotal * Decimal('0.1')  # 10% discount for example
        self.total = self.subtotal + self.tax - self.discount
        self.save()
        return self.discount
    
    def generate_receipt(self):
        """Generate receipt data for the order"""
        return {
            'order_number': self.order_number,
            'date': self.created_at,
            'customer': str(self.customer),
            'items': [{
                'product': item.product.name,
                'quantity': item.quantity,
                'price': item.price,
                'subtotal': item.subtotal
            } for item in self.items.all()],
            'subtotal': self.subtotal,
            'tax': self.tax,
            'discount': self.discount,
            'total': self.total,
            'amount_paid': self.amount_paid,
            'amount_due': self.amount_due
        }

class Expense(models.Model):
    category = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

# Order Item model
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name}"
    
    @property
    def subtotal(self):
        return self.quantity * self.price
    
    def save(self, *args, **kwargs):
        # Update inventory when order item is created
        if not self.pk and self.order.status in ['confirmed', 'processing']:
            inventory = self.product.inventory
            if inventory.quantity >= self.quantity:
                inventory.adjust_stock(
                    inventory.quantity - self.quantity,
                    f"Sold in order #{self.order.order_number}",
                    self.order.customer.user
                )
        
        super().save(*args, **kwargs)

# Payment model
class Payment(models.Model):
    PAYMENT_METHODS = (
        ('cash', 'Cash'),
        ('card', 'Credit Card'),
        ('bank', 'Bank Transfer'),
        ('credit', 'Store Credit'),
        ('mpesa', 'M-Pesa'),

    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment of ${self.amount} for Order #{self.order.order_number}"

# Debt model
class Debt(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='debts')
    order = models.OneToOneField('Order', on_delete=models.CASCADE, related_name='debt')
    initial_amount = models.DecimalField(max_digits=10, decimal_places=2)
    remaining_amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    is_settled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Debt of ${self.remaining_amount} for {self.customer}"
    
    def save(self, *args, **kwargs):
        # Update is_settled status based on remaining amount
        if self.remaining_amount <= 0:
            self.is_settled = True
        
        super().save(*args, **kwargs)
    
    def add_payment(self, amount, method, reference='', processed_by=None):
        """Add payment to debt"""
        if amount <= 0 or self.is_settled:
            return None
        
        # Create payment
        payment = self.order.add_payment(amount, method, reference, processed_by)
        
        # Update debt amount
        self.remaining_amount = max(0, self.remaining_amount - amount)
        self.save()
        
        return payment

# Notification model
class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('low_stock', 'Low Stock Alert'),
        ('new_order', 'New Order'),
        ('payment_received', 'Payment Received'),
        ('debt_reminder', 'Debt Payment Reminder'),
        ('system', 'System Notification'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    send_sms = models.BooleanField(default=False)
    sms_sent = models.BooleanField(default=False)
        
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.is_read = True
        self.save()
        return self
    
    def send_email(self):
        """Send notification via email"""
        if self.user and self.user.email:
            subject = self.title
            html_message = render_to_string('emails/notification.html', {
                'notification': self
            })
            
            send_async_email(subject, html_message, [self.user.email])
            return True
        return False

    def send_sms_notification(self):
        if self.send_sms and self.user.customer.phone:
            message = f"{self.title}: {self.message}"
            success = send_sms(self.user.customer.phone, message)
            if success:
                self.sms_sent = True
                self.save()
            return success
        return False

# Audit Log model
class AuditLog(models.Model):
    ACTION_TYPES = (
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
    )
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=10, choices=ACTION_TYPES)
    model_name = models.CharField(max_length=100)
    object_id = models.PositiveIntegerField()
    details = models.JSONField()  # Stores changed fields and values
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.user} {self.action}d {self.model_name} #{self.object_id}"

# models.py (add HelpTip model)
class HelpTip(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    page_url = models.CharField(max_length=200, help_text="URL pattern where this tip should appear")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title

# models.py - Add this model
class Discount(models.Model):
    DISCOUNT_TYPES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    products = models.ManyToManyField(Product, blank=True)
    categories = models.ManyToManyField(Category, blank=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

# models.py - Add tax model
class TaxRate(models.Model):
    name = models.CharField(max_length=50)
    rate = models.DecimalField(max_digits=5, decimal_places=4, validators=[MinValueValidator(0)])  # 0.0825 for 8.25%
    is_active = models.BooleanField(default=True)
    applicable_categories = models.ManyToManyField(Category, blank=True)
    country = models.CharField(max_length=2, blank=True)  # ISO country code
    state = models.CharField(max_length=50, blank=True)
    
    def __str__(self):
        return f"{self.name} ({self.rate * 100}%)"

# models.py - Add barcode scan history
class BarcodeScan(models.Model):
    SCAN_TYPES = (
        ('sale', 'Sale'),
        ('inventory', 'Inventory Check'),
        ('receiving', 'Receiving'),
        ('association', 'Product Association'),
    )
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='barcode_scans')
    scanned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='barcode_scans')
    scan_type = models.CharField(max_length=20, choices=SCAN_TYPES)
    scanned_at = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=100, blank=True)  # Where was it scanned?
    
    class Meta:
        ordering = ['-scanned_at']
    
    def __str__(self):
        return f"{self.product.name} scanned by {self.scanned_by}"

# models.py - Add return/refund system
class Return(models.Model):
    RETURN_REASONS = (
        ('defective', 'Defective Product'),
        ('wrong_item', 'Wrong Item Received'),
        ('customer_change_mind', 'Customer Changed Mind'),
        ('damaged', 'Damaged in Transit'),
    )
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='returns')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    reason = models.CharField(max_length=50, choices=RETURN_REASONS)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, default='pending', choices=(
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('processed', 'Processed'),
    ))
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_returns')
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_returns')
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Return for {self.product.name} from Order #{self.order.order_number}"

class Expense(models.Model):
    category = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.category} - {self.amount}"

# Signal handlers
@receiver(post_save, sender=Product)
def create_product_inventory(sender, instance, created, **kwargs):
    """Create inventory record when a new product is created"""
    if created:
        Inventory.objects.create(product=instance, quantity=0)

@receiver(post_save, sender=User)
def create_customer_profile(sender, instance, created, **kwargs):
    """Create customer profile when a new user is created"""
    if created and not instance.is_staff:
        try:
            Customer.objects.get_or_create(user=instance)
        except Exception as e:
            # Log the error instead of crashing
            print(f"Error creating customer profile: {e}")

@receiver(post_save, sender=Order)
def create_order_debt(sender, instance, created, **kwargs):
    """Create debt record when an order is created with payment status not fully paid"""
    if created and instance.payment_status != 'paid':
        Debt.objects.create(
            customer=instance.customer,
            order=instance,
            initial_amount=instance.total,
            remaining_amount=instance.total,
            due_date=timezone.now() + timezone.timedelta(days=30)  # 30 days from now
        )

@receiver(post_save, sender=Inventory)
def check_low_stock(sender, instance, **kwargs):
    """Check for low stock when inventory is updated"""
    instance.product.check_low_stock()

@receiver(post_save, sender=Inventory)
def log_inventory_change(sender, instance, created, **kwargs):
    """Log inventory changes for auditing"""
    if not created:  # Only log updates, not creations
        try:
            old_instance = Inventory.objects.get(pk=instance.pk)
            if old_instance.quantity != instance.quantity:
                InventoryHistory.objects.create(
                    inventory=instance,
                    old_quantity=old_instance.quantity,
                    new_quantity=instance.quantity,
                    difference=instance.quantity - old_instance.quantity,
                    reason='Manual adjustment',
                    changed_by=None  # You might want to track who made the change
                )
        except Inventory.DoesNotExist:
            pass