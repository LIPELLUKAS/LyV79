from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

class Fee(models.Model):
    """
    Modelo para las cuotas y tarifas de la Logia.
    """
    name = models.CharField(_('nombre'), max_length=100)
    description = models.TextField(_('descripción'), blank=True)
    amount = models.DecimalField(_('monto'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Tipo de cuota
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    ANNUAL = 'annual'
    ONE_TIME = 'one_time'
    SPECIAL = 'special'
    
    FEE_TYPE_CHOICES = [
        (MONTHLY, _('Mensual')),
        (QUARTERLY, _('Trimestral')),
        (ANNUAL, _('Anual')),
        (ONE_TIME, _('Única vez')),
        (SPECIAL, _('Especial')),
    ]
    
    fee_type = models.CharField(
        _('tipo de cuota'),
        max_length=20,
        choices=FEE_TYPE_CHOICES,
        default=MONTHLY
    )
    
    # Estado de la cuota
    is_active = models.BooleanField(_('activa'), default=True)
    
    # Fechas
    start_date = models.DateField(_('fecha de inicio'), null=True, blank=True)
    end_date = models.DateField(_('fecha de fin'), null=True, blank=True)
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_fees',
        verbose_name=_('creada por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('cuota')
        verbose_name_plural = _('cuotas')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.get_fee_type_display()} (${self.amount})"


class Payment(models.Model):
    """
    Modelo para los pagos realizados por los miembros.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name=_('usuario')
    )
    fee = models.ForeignKey(
        Fee,
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name=_('cuota')
    )
    amount = models.DecimalField(_('monto'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Estado del pago
    PENDING = 'pending'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'
    
    PAYMENT_STATUS_CHOICES = [
        (PENDING, _('Pendiente')),
        (COMPLETED, _('Completado')),
        (CANCELLED, _('Cancelado')),
        (REFUNDED, _('Reembolsado')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default=PENDING
    )
    
    # Método de pago
    CASH = 'cash'
    BANK_TRANSFER = 'bank_transfer'
    CHECK = 'check'
    CREDIT_CARD = 'credit_card'
    OTHER = 'other'
    
    PAYMENT_METHOD_CHOICES = [
        (CASH, _('Efectivo')),
        (BANK_TRANSFER, _('Transferencia bancaria')),
        (CHECK, _('Cheque')),
        (CREDIT_CARD, _('Tarjeta de crédito')),
        (OTHER, _('Otro')),
    ]
    
    payment_method = models.CharField(
        _('método de pago'),
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default=CASH
    )
    
    # Fechas
    payment_date = models.DateField(_('fecha de pago'), null=True, blank=True)
    due_date = models.DateField(_('fecha de vencimiento'), null=True, blank=True)
    
    # Referencia y notas
    reference = models.CharField(_('referencia'), max_length=100, blank=True)
    notes = models.TextField(_('notas'), blank=True)
    
    # Campos para auditoría
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_payments',
        verbose_name=_('registrado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('pago')
        verbose_name_plural = _('pagos')
        ordering = ['-payment_date', '-created_at']
    
    def __str__(self):
        return f"{self.user.symbolic_name or self.user.username} - {self.fee.name} - ${self.amount}"


class Invoice(models.Model):
    """
    Modelo para las facturas emitidas.
    """
    invoice_number = models.CharField(_('número de factura'), max_length=20, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='invoices',
        verbose_name=_('usuario')
    )
    
    # Fechas
    issue_date = models.DateField(_('fecha de emisión'))
    due_date = models.DateField(_('fecha de vencimiento'))
    
    # Montos
    subtotal = models.DecimalField(_('subtotal'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    tax = models.DecimalField(_('impuesto'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], default=0)
    total = models.DecimalField(_('total'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Estado de la factura
    DRAFT = 'draft'
    ISSUED = 'issued'
    PAID = 'paid'
    CANCELLED = 'cancelled'
    
    INVOICE_STATUS_CHOICES = [
        (DRAFT, _('Borrador')),
        (ISSUED, _('Emitida')),
        (PAID, _('Pagada')),
        (CANCELLED, _('Cancelada')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=INVOICE_STATUS_CHOICES,
        default=DRAFT
    )
    
    # Notas
    notes = models.TextField(_('notas'), blank=True)
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_invoices',
        verbose_name=_('creada por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('factura')
        verbose_name_plural = _('facturas')
        ordering = ['-issue_date', 'invoice_number']
    
    def __str__(self):
        return f"Factura #{self.invoice_number} - {self.user.symbolic_name or self.user.username}"


class InvoiceItem(models.Model):
    """
    Modelo para los ítems de una factura.
    """
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('factura')
    )
    description = models.CharField(_('descripción'), max_length=200)
    quantity = models.PositiveIntegerField(_('cantidad'), default=1)
    unit_price = models.DecimalField(_('precio unitario'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_price = models.DecimalField(_('precio total'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Referencia opcional a una cuota
    fee = models.ForeignKey(
        Fee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='invoice_items',
        verbose_name=_('cuota')
    )
    
    class Meta:
        verbose_name = _('ítem de factura')
        verbose_name_plural = _('ítems de factura')
    
    def __str__(self):
        return f"{self.description} - {self.invoice.invoice_number}"


class FinancialReport(models.Model):
    """
    Modelo para los informes financieros.
    """
    title = models.CharField(_('título'), max_length=100)
    description = models.TextField(_('descripción'), blank=True)
    
    # Período del informe
    start_date = models.DateField(_('fecha de inicio'))
    end_date = models.DateField(_('fecha de fin'))
    
    # Tipo de informe
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    ANNUAL = 'annual'
    SPECIAL = 'special'
    
    REPORT_TYPE_CHOICES = [
        (MONTHLY, _('Mensual')),
        (QUARTERLY, _('Trimestral')),
        (ANNUAL, _('Anual')),
        (SPECIAL, _('Especial')),
    ]
    
    report_type = models.CharField(
        _('tipo de informe'),
        max_length=20,
        choices=REPORT_TYPE_CHOICES,
        default=MONTHLY
    )
    
    # Datos financieros
    total_income = models.DecimalField(_('ingresos totales'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_expenses = models.DecimalField(_('gastos totales'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    balance = models.DecimalField(_('balance'), max_digits=10, decimal_places=2)
    
    # Archivo del informe
    file = models.FileField(_('archivo'), upload_to='financial_reports/', null=True, blank=True)
    
    # Estado del informe
    DRAFT = 'draft'
    FINALIZED = 'finalized'
    APPROVED = 'approved'
    
    REPORT_STATUS_CHOICES = [
        (DRAFT, _('Borrador')),
        (FINALIZED, _('Finalizado')),
        (APPROVED, _('Aprobado')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=REPORT_STATUS_CHOICES,
        default=DRAFT
    )
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_reports',
        verbose_name=_('creado por')
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_reports',
        verbose_name=_('aprobado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('informe financiero')
        verbose_name_plural = _('informes financieros')
        ordering = ['-end_date', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.start_date} - {self.end_date})"


class Expense(models.Model):
    """
    Modelo para los gastos de la Logia.
    """
    title = models.CharField(_('título'), max_length=100)
    description = models.TextField(_('descripción'), blank=True)
    amount = models.DecimalField(_('monto'), max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Categoría de gasto
    RENT = 'rent'
    UTILITIES = 'utilities'
    SUPPLIES = 'supplies'
    MAINTENANCE = 'maintenance'
    EVENTS = 'events'
    CHARITY = 'charity'
    OTHER = 'other'
    
    EXPENSE_CATEGORY_CHOICES = [
        (RENT, _('Alquiler')),
        (UTILITIES, _('Servicios')),
        (SUPPLIES, _('Suministros')),
        (MAINTENANCE, _('Mantenimiento')),
        (EVENTS, _('Eventos')),
        (CHARITY, _('Caridad')),
        (OTHER, _('Otro')),
    ]
    
    category = models.CharField(
        _('categoría'),
        max_length=20,
        choices=EXPENSE_CATEGORY_CHOICES,
        default=OTHER
    )
    
    # Fechas
    expense_date = models.DateField(_('fecha de gasto'))
    payment_date = models.DateField(_('fecha de pago'), null=True, blank=True)
    
    # Estado del gasto
    PENDING = 'pending'
    PAID = 'paid'
    CANCELLED = 'cancelled'
    
    EXPENSE_STATUS_CHOICES = [
        (PENDING, _('Pendiente')),
        (PAID, _('Pagado')),
        (CANCELLED, _('Cancelado')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=EXPENSE_STATUS_CHOICES,
        default=PENDING
    )
    
    # Comprobante
    receipt = models.FileField(_('comprobante'), upload_to='expense_receipts/', null=True, blank=True)
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_expenses',
        verbose_name=_('creado por')
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_expenses',
        verbose_name=_('aprobado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('gasto')
        verbose_name_plural = _('gastos')
        ordering = ['-expense_date', '-created_at']
    
    def __str__(self):
        return f"{self.title} - ${self.amount} ({self.get_category_display()})"
