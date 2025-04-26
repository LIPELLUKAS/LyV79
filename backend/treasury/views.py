from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Fee, Payment, Invoice, InvoiceItem, FinancialReport, Expense
from .serializers import (
    FeeSerializer, PaymentSerializer, InvoiceSerializer, InvoiceCreateSerializer,
    InvoiceItemSerializer, FinancialReportSerializer, ExpenseSerializer
)
from authentication.mixins import TreasurerRequiredMixin, MasterMasonRequiredMixin

User = get_user_model()

class FeeViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar cuotas y tarifas.
    """
    queryset = Fee.objects.all()
    serializer_class = FeeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar cuotas según parámetros de búsqueda.
        """
        queryset = Fee.objects.all().order_by('-created_at')
        
        # Filtrar por estado activo/inactivo
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        # Filtrar por tipo de cuota
        fee_type = self.request.query_params.get('fee_type')
        if fee_type:
            queryset = queryset.filter(fee_type=fee_type)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def payments(self, request, pk=None):
        """
        Obtener los pagos asociados a una cuota.
        """
        fee = self.get_object()
        payments = Payment.objects.filter(fee=fee)
        serializer = PaymentSerializer(payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """
        Obtener solo las cuotas activas.
        """
        active_fees = Fee.objects.filter(is_active=True)
        serializer = self.get_serializer(active_fees, many=True)
        return Response(serializer.data)


class PaymentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar pagos.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar pagos según parámetros de búsqueda.
        """
        queryset = Payment.objects.all().order_by('-payment_date', '-created_at')
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por cuota
        fee_id = self.request.query_params.get('fee_id')
        if fee_id:
            queryset = queryset.filter(fee_id=fee_id)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por método de pago
        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        # Filtrar por rango de fechas de pago
        payment_date_from = self.request.query_params.get('payment_date_from')
        if payment_date_from:
            queryset = queryset.filter(payment_date__gte=payment_date_from)
        
        payment_date_to = self.request.query_params.get('payment_date_to')
        if payment_date_to:
            queryset = queryset.filter(payment_date__lte=payment_date_to)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Obtener pagos pendientes.
        """
        pending_payments = Payment.objects.filter(status=Payment.PENDING)
        serializer = self.get_serializer(pending_payments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """
        Obtener pagos vencidos.
        """
        today = timezone.now().date()
        overdue_payments = Payment.objects.filter(
            status=Payment.PENDING,
            due_date__lt=today
        )
        serializer = self.get_serializer(overdue_payments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_completed(self, request, pk=None):
        """
        Marcar un pago como completado.
        """
        payment = self.get_object()
        
        if payment.status == Payment.COMPLETED:
            return Response(
                {'detail': 'El pago ya está marcado como completado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = Payment.COMPLETED
        payment.payment_date = request.data.get('payment_date', timezone.now().date())
        payment.payment_method = request.data.get('payment_method', payment.payment_method)
        payment.reference = request.data.get('reference', payment.reference)
        payment.notes = request.data.get('notes', payment.notes)
        payment.recorded_by = request.user
        payment.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_cancelled(self, request, pk=None):
        """
        Marcar un pago como cancelado.
        """
        payment = self.get_object()
        
        if payment.status == Payment.CANCELLED:
            return Response(
                {'detail': 'El pago ya está marcado como cancelado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = Payment.CANCELLED
        payment.notes = request.data.get('notes', payment.notes)
        payment.recorded_by = request.user
        payment.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)


class InvoiceViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar facturas.
    """
    queryset = Invoice.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InvoiceCreateSerializer
        return InvoiceSerializer
    
    def get_queryset(self):
        """
        Filtrar facturas según parámetros de búsqueda.
        """
        queryset = Invoice.objects.all().order_by('-issue_date', 'invoice_number')
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por rango de fechas de emisión
        issue_date_from = self.request.query_params.get('issue_date_from')
        if issue_date_from:
            queryset = queryset.filter(issue_date__gte=issue_date_from)
        
        issue_date_to = self.request.query_params.get('issue_date_to')
        if issue_date_to:
            queryset = queryset.filter(issue_date__lte=issue_date_to)
        
        # Filtrar por número de factura
        invoice_number = self.request.query_params.get('invoice_number')
        if invoice_number:
            queryset = queryset.filter(invoice_number__icontains=invoice_number)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """
        Obtener los ítems de una factura.
        """
        invoice = self.get_object()
        items = invoice.items.all()
        serializer = InvoiceItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """
        Añadir un ítem a una factura.
        """
        invoice = self.get_object()
        
        # Verificar que la factura esté en estado borrador
        if invoice.status != Invoice.DRAFT:
            return Response(
                {'detail': 'Solo se pueden añadir ítems a facturas en estado borrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = InvoiceItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(invoice=invoice)
            
            # Actualizar los totales de la factura
            invoice.subtotal = invoice.items.aggregate(total=Sum('total_price'))['total'] or 0
            invoice.total = invoice.subtotal + invoice.tax
            invoice.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def issue(self, request, pk=None):
        """
        Emitir una factura (cambiar estado de borrador a emitida).
        """
        invoice = self.get_object()
        
        if invoice.status != Invoice.DRAFT:
            return Response(
                {'detail': 'Solo se pueden emitir facturas en estado borrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.status = Invoice.ISSUED
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_paid(self, request, pk=None):
        """
        Marcar una factura como pagada.
        """
        invoice = self.get_object()
        
        if invoice.status == Invoice.PAID:
            return Response(
                {'detail': 'La factura ya está marcada como pagada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if invoice.status == Invoice.CANCELLED:
            return Response(
                {'detail': 'No se puede marcar como pagada una factura cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.status = Invoice.PAID
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancelar una factura.
        """
        invoice = self.get_object()
        
        if invoice.status == Invoice.CANCELLED:
            return Response(
                {'detail': 'La factura ya está cancelada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if invoice.status == Invoice.PAID:
            return Response(
                {'detail': 'No se puede cancelar una factura pagada.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        invoice.status = Invoice.CANCELLED
        invoice.save()
        
        serializer = self.get_serializer(invoice)
        return Response(serializer.data)


class FinancialReportViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar informes financieros.
    """
    queryset = FinancialReport.objects.all()
    serializer_class = FinancialReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar informes según parámetros de búsqueda.
        """
        queryset = FinancialReport.objects.all().order_by('-end_date', '-created_at')
        
        # Filtrar por tipo de informe
        report_type = self.request.query_params.get('report_type')
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(end_date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(end_date__lte=date_to)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """
        Finalizar un informe financiero.
        """
        report = self.get_object()
        
        if report.status != FinancialReport.DRAFT:
            return Response(
                {'detail': 'Solo se pueden finalizar informes en estado borrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.status = FinancialReport.FINALIZED
        report.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Aprobar un informe financiero.
        """
        report = self.get_object()
        
        if report.status != FinancialReport.FINALIZED:
            return Response(
                {'detail': 'Solo se pueden aprobar informes finalizados.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        report.status = FinancialReport.APPROVED
        report.approved_by = request.user
        report.save()
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar gastos.
    """
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar gastos según parámetros de búsqueda.
        """
        queryset = Expense.objects.all().order_by('-expense_date', '-created_at')
        
        # Filtrar por categoría
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(expense_date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(expense_date__lte=date_to)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Aprobar un gasto.
        """
        expense = self.get_object()
        
        if expense.status != Expense.PENDING:
            return Response(
                {'detail': 'Solo se pueden aprobar gastos pendientes.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense.status = Expense.PAID
        expense.payment_date = request.data.get('payment_date', timezone.now().date())
        expense.approved_by = request.user
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancelar un gasto.
        """
        expense = self.get_object()
        
        if expense.status == Expense.CANCELLED:
            return Response(
                {'detail': 'El gasto ya está cancelado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if expense.status == Expense.PAID:
            return Response(
                {'detail': 'No se puede cancelar un gasto pagado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense.status = Expense.CANCELLED
        expense.save()
        
        serializer = self.get_serializer(expense)
        return Response(serializer.data)
