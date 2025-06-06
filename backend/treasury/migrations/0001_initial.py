# Generated by Django 5.2 on 2025-04-28 02:01

import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100, verbose_name='título')),
                ('description', models.TextField(blank=True, verbose_name='descripción')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='monto')),
                ('category', models.CharField(choices=[('rent', 'Alquiler'), ('utilities', 'Servicios'), ('supplies', 'Suministros'), ('maintenance', 'Mantenimiento'), ('events', 'Eventos'), ('charity', 'Caridad'), ('other', 'Otro')], default='other', max_length=20, verbose_name='categoría')),
                ('expense_date', models.DateField(verbose_name='fecha de gasto')),
                ('payment_date', models.DateField(blank=True, null=True, verbose_name='fecha de pago')),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('paid', 'Pagado'), ('cancelled', 'Cancelado')], default='pending', max_length=20, verbose_name='estado')),
                ('receipt', models.FileField(blank=True, null=True, upload_to='expense_receipts/', verbose_name='comprobante')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_expenses', to=settings.AUTH_USER_MODEL, verbose_name='aprobado por')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_expenses', to=settings.AUTH_USER_MODEL, verbose_name='creado por')),
            ],
            options={
                'verbose_name': 'gasto',
                'verbose_name_plural': 'gastos',
                'ordering': ['-expense_date', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Fee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='nombre')),
                ('description', models.TextField(blank=True, verbose_name='descripción')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='monto')),
                ('fee_type', models.CharField(choices=[('monthly', 'Mensual'), ('quarterly', 'Trimestral'), ('annual', 'Anual'), ('one_time', 'Única vez'), ('special', 'Especial')], default='monthly', max_length=20, verbose_name='tipo de cuota')),
                ('is_active', models.BooleanField(default=True, verbose_name='activa')),
                ('start_date', models.DateField(blank=True, null=True, verbose_name='fecha de inicio')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='fecha de fin')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_fees', to=settings.AUTH_USER_MODEL, verbose_name='creada por')),
            ],
            options={
                'verbose_name': 'cuota',
                'verbose_name_plural': 'cuotas',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='FinancialReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100, verbose_name='título')),
                ('description', models.TextField(blank=True, verbose_name='descripción')),
                ('start_date', models.DateField(verbose_name='fecha de inicio')),
                ('end_date', models.DateField(verbose_name='fecha de fin')),
                ('report_type', models.CharField(choices=[('monthly', 'Mensual'), ('quarterly', 'Trimestral'), ('annual', 'Anual'), ('special', 'Especial')], default='monthly', max_length=20, verbose_name='tipo de informe')),
                ('total_income', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='ingresos totales')),
                ('total_expenses', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='gastos totales')),
                ('balance', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='balance')),
                ('file', models.FileField(blank=True, null=True, upload_to='financial_reports/', verbose_name='archivo')),
                ('status', models.CharField(choices=[('draft', 'Borrador'), ('finalized', 'Finalizado'), ('approved', 'Aprobado')], default='draft', max_length=20, verbose_name='estado')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('approved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='approved_reports', to=settings.AUTH_USER_MODEL, verbose_name='aprobado por')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_reports', to=settings.AUTH_USER_MODEL, verbose_name='creado por')),
            ],
            options={
                'verbose_name': 'informe financiero',
                'verbose_name_plural': 'informes financieros',
                'ordering': ['-end_date', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Invoice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('invoice_number', models.CharField(max_length=20, unique=True, verbose_name='número de factura')),
                ('issue_date', models.DateField(verbose_name='fecha de emisión')),
                ('due_date', models.DateField(verbose_name='fecha de vencimiento')),
                ('subtotal', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='subtotal')),
                ('tax', models.DecimalField(decimal_places=2, default=0, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='impuesto')),
                ('total', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='total')),
                ('status', models.CharField(choices=[('draft', 'Borrador'), ('issued', 'Emitida'), ('paid', 'Pagada'), ('cancelled', 'Cancelada')], default='draft', max_length=20, verbose_name='estado')),
                ('notes', models.TextField(blank=True, verbose_name='notas')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('created_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='created_invoices', to=settings.AUTH_USER_MODEL, verbose_name='creada por')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='invoices', to=settings.AUTH_USER_MODEL, verbose_name='usuario')),
            ],
            options={
                'verbose_name': 'factura',
                'verbose_name_plural': 'facturas',
                'ordering': ['-issue_date', 'invoice_number'],
            },
        ),
        migrations.CreateModel(
            name='InvoiceItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=200, verbose_name='descripción')),
                ('quantity', models.PositiveIntegerField(default=1, verbose_name='cantidad')),
                ('unit_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='precio unitario')),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='precio total')),
                ('fee', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='invoice_items', to='treasury.fee', verbose_name='cuota')),
                ('invoice', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='treasury.invoice', verbose_name='factura')),
            ],
            options={
                'verbose_name': 'ítem de factura',
                'verbose_name_plural': 'ítems de factura',
            },
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, validators=[django.core.validators.MinValueValidator(0)], verbose_name='monto')),
                ('status', models.CharField(choices=[('pending', 'Pendiente'), ('completed', 'Completado'), ('cancelled', 'Cancelado'), ('refunded', 'Reembolsado')], default='pending', max_length=20, verbose_name='estado')),
                ('payment_method', models.CharField(choices=[('cash', 'Efectivo'), ('bank_transfer', 'Transferencia bancaria'), ('check', 'Cheque'), ('credit_card', 'Tarjeta de crédito'), ('other', 'Otro')], default='cash', max_length=20, verbose_name='método de pago')),
                ('payment_date', models.DateField(blank=True, null=True, verbose_name='fecha de pago')),
                ('due_date', models.DateField(blank=True, null=True, verbose_name='fecha de vencimiento')),
                ('reference', models.CharField(blank=True, max_length=100, verbose_name='referencia')),
                ('notes', models.TextField(blank=True, verbose_name='notas')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='fecha de creación')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='fecha de actualización')),
                ('fee', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='payments', to='treasury.fee', verbose_name='cuota')),
                ('recorded_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='recorded_payments', to=settings.AUTH_USER_MODEL, verbose_name='registrado por')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='payments', to=settings.AUTH_USER_MODEL, verbose_name='usuario')),
            ],
            options={
                'verbose_name': 'pago',
                'verbose_name_plural': 'pagos',
                'ordering': ['-payment_date', '-created_at'],
            },
        ),
    ]
