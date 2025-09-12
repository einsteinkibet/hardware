# urls.py
from django.urls import path, include
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Authentication URLs
    path('auth/login/', views_auth.api_login, name='api_login'),
    path('auth/logout/', views_auth.api_logout, name='api_logout'),
    path('auth/register/', views_auth.api_register, name='api_register'),
    path('auth/profile/', views_auth.api_profile, name='api_profile'),

    # Category URLs
    path('categories/', views.CategoryListView.as_view(), name='category_list'),
    path('categories/add/', views.category_create, name='category_create'),
    path('categories/<int:pk>/edit/', views.category_update, name='category_update'),
    path('categories/<int:pk>/delete/', views.category_delete, name='category_delete'),
    
    # Supplier URLs
    path('suppliers/', views.SupplierListView.as_view(), name='supplier_list'),
    path('suppliers/add/', views.supplier_create, name='supplier_create'),
    path('suppliers/<int:pk>/edit/', views.supplier_update, name='supplier_update'),
    path('suppliers/<int:pk>/delete/', views.supplier_delete, name='supplier_delete'),
    
    # Payment URLs
    path('orders/<int:order_id>/payments/', views_payment.payment_list_by_order, name='payment_list_by_order'),
    path('payments/<int:payment_id>/', views_payment.payment_detail, name='payment_detail'),
    path('payments/process/', views_payment.payment_process, name='payment_process'),
    path('payments/<int:payment_id>/refund/', views_payment.payment_refund, name='payment_refund'),
    
    # Discount URLs
    path('discounts/', views.discount_list, name='discount_list'),
    path('discounts/add/', views.discount_create, name='discount_create'),
    
    # Return URLs
    path('returns/', views.return_list, name='return_list'),
    path('orders/<int:order_id>/return/', views.create_return, name='create_return'),
        
    # Tag URLs
    path('tags/', views.TagListView.as_view(), name='tag_list'),
    path('tags/add/', views.tag_create, name='tag_create'),
    path('tags/<int:pk>/edit/', views.tag_update, name='tag_update'),
    path('tags/<int:pk>/delete/', views.tag_delete, name='tag_delete'),
    
    # Product URLs
    path('products/', views.ProductListView.as_view(), name='product_list'),
    path('products/<int:pk>/', views.product_detail, name='product_detail'),
    path('products/add/', views.product_create, name='product_create'),
    path('products/<int:pk>/edit/', views.product_update, name='product_update'),
    path('products/<int:pk>/delete/', views.product_delete, name='product_delete'),
    
    # Product Image URLs
    path('products/<int:product_pk>/images/add/', views.product_image_add, name='product_image_add'),
    path('product-images/<int:pk>/delete/', views.product_image_delete, name='product_image_delete'),
    path('product-images/<int:pk>/set-primary/', views.product_image_set_primary, name='product_image_set_primary'),
    
    # Inventory URLs
    path('inventory/', views.inventory_list, name='inventory_list'),
    path('inventory/<int:pk>/edit/', views.inventory_update, name='inventory_update'),
    path('inventory/<int:pk>/adjust/', views.inventory_adjust, name='inventory_adjust'),
    path('inventory/<int:pk>/history/', views.inventory_history, name='inventory_history'),
    
    # Customer URLs (Optional)
    path('customers/', views.customer_list, name='customer_list'),
    path('customers/<int:pk>/', views.customer_detail, name='customer_detail'),
    path('customers/add/', views.customer_create, name='customer_create'),
    path('customers/<int:pk>/edit/', views.customer_update, name='customer_update'),
    path('customers/<int:pk>/adjust-balance/', views.customer_balance_adjust, name='customer_balance_adjust'),
    
    # Cart URLs
    path('cart/', views.view_cart, name='view_cart'),
    path('cart/add/<int:product_pk>/', views.add_to_cart, name='add_to_cart'),
    path('cart/update/<int:item_pk>/', views.update_cart_item, name='update_cart_item'),
    path('cart/remove/<int:item_pk>/', views.remove_from_cart, name='remove_from_cart'),
    path('cart/clear/', views.clear_cart, name='clear_cart'),
    
    # Order URLs
    path('orders/', views.order_list, name='order_list'),
    path('orders/<int:pk>/', views.order_detail, name='order_detail'),
    path('checkout/', views.checkout, name='checkout'),
    path('orders/<int:pk>/update-status/', views.order_update_status, name='order_update_status'),
    path('orders/<int:pk>/add-payment/', views.order_add_payment, name='order_add_payment'),
    path('orders/<int:pk>/receipt/', views.generate_receipt, name='generate_receipt'),
    
    # Debt URLs
    path('debts/', views.debt_list, name='debt_list'),
    path('debts/<int:pk>/', views.debt_detail, name='debt_detail'),
    
    # Notification URLs
    path('notifications/', views.notification_list, name='notification_list'),
    path('notifications/<int:pk>/mark-read/', views.notification_mark_read, name='notification_mark_read'),
    path('notifications/mark-all-read/', views.notification_mark_all_read, name='notification_mark_all_read'),
    
    # Audit Log URLs
    path('audit-log/', views.audit_log, name='audit_log'),
    
    # Home page
    path('', views.ProductListView.as_view(), name='home'),

    # Dashboard
    path('dashboard/', views.dashboard, name='dashboard'),

    # Barcode URLs
    path('barcode/scan/', views.barcode_scan, name='barcode_scan'),
    path('products/<int:product_pk>/barcode/', views.barcode_associate, name='barcode_associate'),
    
    # Export URLs
    path('export/<str:model_name>/', views.export_data, name='export_data'),
    
    # PWA URLs
    path('serviceworker.js', serve, {'path': 'js/serviceworker.js', 'document_root': settings.STATIC_ROOT}),
    path('manifest.json', serve, {'path': 'manifest.json', 'document_root': settings.STATIC_ROOT}),

    #expense urls
    path('expenses/', views.expense_list, name='expense_list'),
    path('expenses/<int:pk>/', views.expense_detail, name='expense_detail'),
    path('expenses/add/', views.expense_create, name='expense_create'),
    path('expenses/<int:pk>/edit/', views.expense_update, name='expense_update'),
    path('expenses/<int:pk>/delete/', views.expense_delete, name='expense_delete'),

    # Export URLs
    path('export/products/', views.export_data, {'model_name': 'products'}, name='export_products'),
    path('export/orders/', views.export_data, {'model_name': 'orders'}, name='export_orders'),
    path('export/inventory/', views.export_data, {'model_name': 'inventory'}, name='export_inventory'),
    path('export/customers/', views.export_data, {'model_name': 'customers'}, name='export_customers'),
    
    # Barcode URLs
    path('barcode/scan/', views.barcode_scan, name='barcode_scan'),
    path('products/<int:product_pk>/barcode/', views.barcode_associate, name='barcode_associate'),
    
    # Dashboard URLs
    path('dashboard/', views.dashboard, name='dashboard'),
    
    # Notification URLs
    path('notifications/', views.notification_list, name='notification_list'),
    path('notifications/<int:pk>/mark-read/', views.notification_mark_read, name='notification_mark_read'),
    path('notifications/mark-all-read/', views.notification_mark_all_read, name='notification_mark_all_read'),
    path('notifications/<int:pk>/', views.notification_mark_read, name='notification_delete'),
]