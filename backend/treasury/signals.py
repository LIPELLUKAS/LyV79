from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Payment, Invoice, InvoiceItem, FinancialReport, Expense

@receiver(post_save, sender=Payment)
def update_payment_status(sender, instance, created, **kwargs):
    """
    Actualiza automáticamente la fecha de pago cuando se marca como completado.
    """
    if not created and instance.status == Payment.COMPLETED and not instance.payment_date:
        # Si se marca como completado pero no tiene fecha de pago, establecer la fecha actual
        instance.payment_date = timezone.now().date()
        # Guardar sin disparar la señal de nuevo para evitar recursión
        Payment.objects.filter(pk=instance.pk).update(payment_date=instance.payment_date)

@receiver(pre_save, sender=InvoiceItem)
def calculate_invoice_item_total(sender, instance, **kwargs):
    """
    Calcula automáticamente el precio total del ítem de factura.
    """
    if instance.quantity and instance.unit_price:
        instance.total_price = instance.quantity * instance.unit_price

@receiver(post_save, sender=InvoiceItem)
def update_invoice_totals(sender, instance, created, **kwargs):
    """
    Actualiza los totales de la factura cuando se añade o modifica un ítem.
    """
    invoice = instance.invoice
    
    # Calcular el subtotal sumando todos los ítems
    subtotal = sum(item.total_price for item in invoice.items.all())
    
    # Actualizar el subtotal y el total de la factura
    invoice.subtotal = subtotal
    invoice.total = subtotal + invoice.tax
    
    # Guardar sin disparar la señal de nuevo para evitar recursión
    Invoice.objects.filter(pk=invoice.pk).update(subtotal=invoice.subtotal, total=invoice.total)

@receiver(post_save, sender=Invoice)
def create_payment_for_invoice(sender, instance, created, **kwargs):
    """
    Crea automáticamente un registro de pago pendiente cuando se emite una factura.
    """
    if instance.status == Invoice.ISSUED:
        # Verificar si ya existe un pago para esta factura
        existing_payment = Payment.objects.filter(
            user=instance.user,
            reference=f"Factura #{instance.invoice_number}"
        ).exists()
        
        if not existing_payment:
            # Crear un pago pendiente
            Payment.objects.create(
                user=instance.user,
                fee=None,  # No está asociado a una cuota específica
                amount=instance.total,
                status=Payment.PENDING,
                payment_method=Payment.OTHER,
                due_date=instance.due_date,
                reference=f"Factura #{instance.invoice_number}",
                notes=f"Pago automático generado para la factura #{instance.invoice_number}",
                recorded_by=instance.created_by
            )

@receiver(post_save, sender=FinancialReport)
def update_report_status(sender, instance, created, **kwargs):
    """
    Actualiza el estado del informe financiero cuando se aprueba.
    """
    if instance.status == FinancialReport.APPROVED and not instance.approved_by:
        # Si se marca como aprobado pero no tiene aprobador, establecer un valor por defecto
        FinancialReport.objects.filter(pk=instance.pk).update(approved_by=instance.created_by)

@receiver(post_save, sender=Expense)
def update_expense_status(sender, instance, created, **kwargs):
    """
    Actualiza automáticamente la fecha de pago cuando se marca un gasto como pagado.
    """
    if not created and instance.status == Expense.PAID and not instance.payment_date:
        # Si se marca como pagado pero no tiene fecha de pago, establecer la fecha actual
        instance.payment_date = timezone.now().date()
        # Guardar sin disparar la señal de nuevo para evitar recursión
        Expense.objects.filter(pk=instance.pk).update(payment_date=instance.payment_date)
