from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Fee, Payment, Invoice, InvoiceItem, FinancialReport, Expense

User = get_user_model()

class FeeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    fee_type_display = serializers.ReadOnlyField(source='get_fee_type_display')
    
    class Meta:
        model = Fee
        fields = [
            'id', 'name', 'description', 'amount', 'fee_type', 'fee_type_display',
            'is_active', 'start_date', 'end_date', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class PaymentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.symbolic_name')
    fee_name = serializers.ReadOnlyField(source='fee.name')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    payment_method_display = serializers.ReadOnlyField(source='get_payment_method_display')
    recorded_by_name = serializers.ReadOnlyField(source='recorded_by.symbolic_name')
    
    class Meta:
        model = Payment
        fields = [
            'id', 'user', 'user_name', 'fee', 'fee_name', 'amount',
            'status', 'status_display', 'payment_method', 'payment_method_display',
            'payment_date', 'due_date', 'reference', 'notes',
            'recorded_by', 'recorded_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['recorded_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)

class InvoiceItemSerializer(serializers.ModelSerializer):
    fee_name = serializers.ReadOnlyField(source='fee.name')
    
    class Meta:
        model = InvoiceItem
        fields = [
            'id', 'description', 'quantity', 'unit_price', 'total_price',
            'fee', 'fee_name'
        ]

class InvoiceSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.symbolic_name')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    items = InvoiceItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'user', 'user_name', 'issue_date', 'due_date',
            'subtotal', 'tax', 'total', 'status', 'status_display', 'notes',
            'created_by', 'created_by_name', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class InvoiceCreateSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)
    
    class Meta:
        model = Invoice
        fields = [
            'invoice_number', 'user', 'issue_date', 'due_date',
            'subtotal', 'tax', 'total', 'status', 'notes', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        validated_data['created_by'] = self.context['request'].user
        
        invoice = Invoice.objects.create(**validated_data)
        
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        
        return invoice

class FinancialReportSerializer(serializers.ModelSerializer):
    report_type_display = serializers.ReadOnlyField(source='get_report_type_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    approved_by_name = serializers.ReadOnlyField(source='approved_by.symbolic_name')
    
    class Meta:
        model = FinancialReport
        fields = [
            'id', 'title', 'description', 'start_date', 'end_date',
            'report_type', 'report_type_display', 'total_income', 'total_expenses',
            'balance', 'file', 'status', 'status_display',
            'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'approved_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ExpenseSerializer(serializers.ModelSerializer):
    category_display = serializers.ReadOnlyField(source='get_category_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    approved_by_name = serializers.ReadOnlyField(source='approved_by.symbolic_name')
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'description', 'amount', 'category', 'category_display',
            'expense_date', 'payment_date', 'status', 'status_display', 'receipt',
            'created_by', 'created_by_name', 'approved_by', 'approved_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'approved_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
