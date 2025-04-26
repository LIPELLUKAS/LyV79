from django.contrib import admin
from .models import Fee, Payment, Invoice, InvoiceItem, FinancialReport, Expense

class InvoiceItemInline(admin.TabularInline):
    model = InvoiceItem
    extra = 1

@admin.register(Fee)
class FeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'fee_type', 'is_active', 'start_date', 'end_date')
    list_filter = ('fee_type', 'is_active')
    search_fields = ('name', 'description')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_by', 'created_at', 'updated_at')

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'fee', 'amount', 'status', 'payment_method', 'payment_date', 'due_date')
    list_filter = ('status', 'payment_method', 'payment_date')
    search_fields = ('user__username', 'user__symbolic_name', 'fee__name', 'reference')
    date_hierarchy = 'payment_date'
    readonly_fields = ('recorded_by', 'created_at', 'updated_at')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'user', 'issue_date', 'due_date', 'total', 'status')
    list_filter = ('status', 'issue_date')
    search_fields = ('invoice_number', 'user__username', 'user__symbolic_name')
    date_hierarchy = 'issue_date'
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    inlines = [InvoiceItemInline]

@admin.register(FinancialReport)
class FinancialReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'start_date', 'end_date', 'total_income', 'total_expenses', 'balance', 'status')
    list_filter = ('report_type', 'status', 'end_date')
    search_fields = ('title', 'description')
    date_hierarchy = 'end_date'
    readonly_fields = ('created_by', 'approved_by', 'created_at', 'updated_at')

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'amount', 'expense_date', 'status')
    list_filter = ('category', 'status', 'expense_date')
    search_fields = ('title', 'description')
    date_hierarchy = 'expense_date'
    readonly_fields = ('created_by', 'approved_by', 'created_at', 'updated_at')
