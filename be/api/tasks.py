# tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import Product, Notification

@shared_task
def send_email_async(subject, html_content, recipient_list):
    """Send email asynchronously"""
    text_content = strip_tags(html_content)
    send_mail(
        subject,
        text_content,
        settings.DEFAULT_FROM_EMAIL,
        recipient_list,
        html_message=html_content,
        fail_silently=False,
    )

@shared_task
def check_low_stock():
    """Periodic task to check for low stock"""
    low_stock_products = Product.objects.filter(
        inventory__quantity__lte=models.F('min_stock_level')
    )
    
    for product in low_stock_products:
        # Create notification
        notification = Notification.objects.create(
            type='low_stock',
            title=f'Low Stock Alert: {product.name}',
            message=f'Only {product.current_stock} left in stock. Minimum is {product.min_stock_level}.',
            related_object_id=product.id
        )
        
        # Send email to admins
        admins = User.objects.filter(is_staff=True)
        if admins.exists():
            subject = f'Low Stock Alert: {product.name}'
            html_message = render_to_string('emails/low_stock_alert.html', {
                'product': product,
                'current_stock': product.current_stock,
                'min_stock_level': product.min_stock_level
            })
            
            recipient_list = [admin.email for admin in admins]
            send_email_async.delay(subject, html_message, recipient_list)

@shared_task
def generate_report(report_type, parameters):
    """Generate reports asynchronously"""
    # Implement report generation logic here
    pass