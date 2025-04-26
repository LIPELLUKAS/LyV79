from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    FeeViewSet, PaymentViewSet, InvoiceViewSet,
    FinancialReportViewSet, ExpenseViewSet
)

router = DefaultRouter()
router.register(r'fees', FeeViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'reports', FinancialReportViewSet)
router.register(r'expenses', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
