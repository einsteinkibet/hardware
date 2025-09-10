# reports.py
from django.db import models
from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from .models import Order, Payment, Customer, Product, OrderItem, Expense


class ReportService:
    """Independent static service – if you want to call reports without attaching to models"""
    @staticmethod
    def daily_sales(date=None):
        if not date:
            date = timezone.now().date()
        return Order.objects.filter(
            created_at__date=date,
            status="completed"
        ).aggregate(total_sales=Sum("total_amount"))["total_sales"] or 0

    @staticmethod
    def monthly_revenue_vs_expenses(year=None):
        if not year:
            year = timezone.now().year

        payments = Payment.objects.filter(
            date__year=year
        ).annotate(month=TruncMonth("date")).values("month").annotate(
            revenue=Sum("amount")
        ).order_by("month")

        expenses = Expense.objects.filter(
            created_at__year=year
        ).annotate(month=TruncMonth("created_at")).values("month").annotate(
            cost=Sum("amount")
        ).order_by("month")

        return {"revenue": list(payments), "expenses": list(expenses)}

    @staticmethod
    def debtors_list():
        return Customer.objects.filter(balance__gt=0).order_by("-balance")

    @staticmethod
    def best_selling(limit=10):
        return OrderItem.objects.values("product__name").annotate(
            total_sold=Sum("quantity")
        ).order_by("-total_sold")[:limit]

    @staticmethod
    def low_stock(threshold=5):
        return Product.objects.filter(stock__lte=threshold).order_by("stock")


class ReportManager(models.Manager):
    """If you want to attach reports directly to a model manager"""
    def daily_sales(self, date=None):
        if not date:
            date = timezone.now().date()
        return Order.objects.filter(
            created_at__date=date,
            status="completed"
        ).aggregate(total_sales=Sum("total_amount"))["total_sales"] or 0

    def monthly_revenue_vs_expenses(self, year=None):
        if not year:
            year = timezone.now().year

        payments = Payment.objects.filter(
            date__year=year
        ).annotate(month=TruncMonth("date")).values("month").annotate(
            revenue=Sum("amount")
        ).order_by("month")

        expenses = Expense.objects.filter(
            created_at__year=year
        ).annotate(month=TruncMonth("created_at")).values("month").annotate(
            cost=Sum("amount")
        ).order_by("month")

        return {"revenue": list(payments), "expenses": list(expenses)}

    def debtors_list(self):
        return Customer.objects.filter(balance__gt=0).order_by("-balance")

    def best_selling(self, limit=10):
        return OrderItem.objects.values("product__name").annotate(
            total_sold=Sum("quantity")
        ).order_by("-total_sold")[:limit]

    def low_stock(self, threshold=5):
        return Product.objects.filter(stock__lte=threshold).order_by("stock")
