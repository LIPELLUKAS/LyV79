from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class LodgeConfiguration(models.Model):
    """
    Modelo para la configuración general de la Logia.
    """
    # Información básica de la Logia
    lodge_name = models.CharField(_('nombre de la Logia'), max_length=200)
    lodge_number = models.CharField(_('número de la Logia'), max_length=50, blank=True)
    foundation_date = models.DateField(_('fecha de fundación'), null=True, blank=True)
    
    # Información de la Gran Logia
    grand_lodge_name = models.CharField(_('nombre de la Gran Logia'), max_length=200, blank=True)
    jurisdiction = models.CharField(_('jurisdicción'), max_length=200, blank=True)
    
    # Configuración de visualización
    logo = models.ImageField(_('logo'), upload_to='lodge_logos/', null=True, blank=True)
    primary_color = models.CharField(_('color primario'), max_length=20, default='#1a237e')  # Azul masónico por defecto
    secondary_color = models.CharField(_('color secundario'), max_length=20, default='#ffc107')  # Dorado por defecto
    
    # Configuración de correo electrónico
    email_from = models.EmailField(_('correo electrónico remitente'), blank=True)
    email_signature = models.TextField(_('firma de correo electrónico'), blank=True)
    
    # Configuración de calendario
    calendar_start_month = models.PositiveSmallIntegerField(
        _('mes de inicio del calendario'),
        default=1,
        choices=[(i, str(i)) for i in range(1, 13)]
    )
    
    # Configuración de sistema
    maintenance_mode = models.BooleanField(_('modo mantenimiento'), default=False)
    debug_mode = models.BooleanField(_('modo depuración'), default=False)
    
    # Campos para auditoría
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_configurations',
        verbose_name=_('actualizada por')
    )
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('configuración de Logia')
        verbose_name_plural = _('configuraciones de Logia')
    
    def __str__(self):
        return self.lodge_name
    
    def save(self, *args, **kwargs):
        # Asegurar que solo haya una instancia de configuración
        if not self.pk and LodgeConfiguration.objects.exists():
            # Si ya existe una configuración, actualizar esa en lugar de crear una nueva
            self.pk = LodgeConfiguration.objects.first().pk
        super().save(*args, **kwargs)


class SystemLog(models.Model):
    """
    Modelo para registros del sistema.
    """
    # Tipo de registro
    INFO = 'info'
    WARNING = 'warning'
    ERROR = 'error'
    CRITICAL = 'critical'
    SECURITY = 'security'
    
    LOG_TYPE_CHOICES = [
        (INFO, _('Información')),
        (WARNING, _('Advertencia')),
        (ERROR, _('Error')),
        (CRITICAL, _('Crítico')),
        (SECURITY, _('Seguridad')),
    ]
    
    log_type = models.CharField(
        _('tipo de registro'),
        max_length=20,
        choices=LOG_TYPE_CHOICES,
        default=INFO
    )
    
    # Módulo que generó el registro
    module = models.CharField(_('módulo'), max_length=100)
    
    # Mensaje del registro
    message = models.TextField(_('mensaje'))
    
    # Detalles adicionales (como traceback)
    details = models.TextField(_('detalles'), blank=True)
    
    # Usuario relacionado (opcional)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='system_logs',
        verbose_name=_('usuario')
    )
    
    # Información técnica
    ip_address = models.GenericIPAddressField(_('dirección IP'), null=True, blank=True)
    user_agent = models.TextField(_('agente de usuario'), blank=True)
    
    # Fecha y hora del registro
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('registro del sistema')
        verbose_name_plural = _('registros del sistema')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_log_type_display()}: {self.message[:50]}..."


class BackupConfiguration(models.Model):
    """
    Modelo para la configuración de respaldos automáticos.
    """
    # Estado de los respaldos automáticos
    is_active = models.BooleanField(_('activo'), default=True)
    
    # Frecuencia de respaldos
    DAILY = 'daily'
    WEEKLY = 'weekly'
    MONTHLY = 'monthly'
    
    FREQUENCY_CHOICES = [
        (DAILY, _('Diario')),
        (WEEKLY, _('Semanal')),
        (MONTHLY, _('Mensual')),
    ]
    
    frequency = models.CharField(
        _('frecuencia'),
        max_length=20,
        choices=FREQUENCY_CHOICES,
        default=WEEKLY
    )
    
    # Día de la semana para respaldos semanales (0=Lunes, 6=Domingo)
    weekday = models.PositiveSmallIntegerField(
        _('día de la semana'),
        default=0,
        choices=[
            (0, _('Lunes')),
            (1, _('Martes')),
            (2, _('Miércoles')),
            (3, _('Jueves')),
            (4, _('Viernes')),
            (5, _('Sábado')),
            (6, _('Domingo')),
        ]
    )
    
    # Día del mes para respaldos mensuales
    day_of_month = models.PositiveSmallIntegerField(_('día del mes'), default=1)
    
    # Hora del día para realizar el respaldo
    hour = models.PositiveSmallIntegerField(_('hora'), default=0)
    minute = models.PositiveSmallIntegerField(_('minuto'), default=0)
    
    # Configuración de retención
    keep_daily = models.PositiveIntegerField(_('mantener respaldos diarios'), default=7)
    keep_weekly = models.PositiveIntegerField(_('mantener respaldos semanales'), default=4)
    keep_monthly = models.PositiveIntegerField(_('mantener respaldos mensuales'), default=12)
    
    # Configuración de almacenamiento
    backup_path = models.CharField(_('ruta de respaldos'), max_length=255, default='/backups')
    
    # Opciones de respaldo
    include_media = models.BooleanField(_('incluir archivos multimedia'), default=True)
    compress = models.BooleanField(_('comprimir respaldo'), default=True)
    encrypt = models.BooleanField(_('cifrar respaldo'), default=False)
    
    # Notificación por correo
    notify_on_success = models.BooleanField(_('notificar en éxito'), default=False)
    notify_on_failure = models.BooleanField(_('notificar en fallo'), default=True)
    notification_email = models.EmailField(_('correo electrónico para notificaciones'), blank=True)
    
    # Campos para auditoría
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_backup_configurations',
        verbose_name=_('actualizada por')
    )
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('configuración de respaldos')
        verbose_name_plural = _('configuraciones de respaldos')
    
    def __str__(self):
        return f"Configuración de respaldos ({self.get_frequency_display()})"
    
    def save(self, *args, **kwargs):
        # Asegurar que solo haya una instancia de configuración
        if not self.pk and BackupConfiguration.objects.exists():
            # Si ya existe una configuración, actualizar esa en lugar de crear una nueva
            self.pk = BackupConfiguration.objects.first().pk
        super().save(*args, **kwargs)


class Backup(models.Model):
    """
    Modelo para registros de respaldos realizados.
    """
    # Nombre del archivo de respaldo
    filename = models.CharField(_('nombre de archivo'), max_length=255)
    
    # Ruta completa del archivo
    file_path = models.CharField(_('ruta de archivo'), max_length=255)
    
    # Tamaño del archivo en bytes
    file_size = models.BigIntegerField(_('tamaño de archivo'), default=0)
    
    # Tipo de respaldo
    MANUAL = 'manual'
    SCHEDULED = 'scheduled'
    
    BACKUP_TYPE_CHOICES = [
        (MANUAL, _('Manual')),
        (SCHEDULED, _('Programado')),
    ]
    
    backup_type = models.CharField(
        _('tipo de respaldo'),
        max_length=20,
        choices=BACKUP_TYPE_CHOICES,
        default=SCHEDULED
    )
    
    # Estado del respaldo
    SUCCESS = 'success'
    FAILURE = 'failure'
    IN_PROGRESS = 'in_progress'
    
    STATUS_CHOICES = [
        (SUCCESS, _('Éxito')),
        (FAILURE, _('Fallo')),
        (IN_PROGRESS, _('En progreso')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=IN_PROGRESS
    )
    
    # Mensaje de error (si lo hay)
    error_message = models.TextField(_('mensaje de error'), blank=True)
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_backups',
        verbose_name=_('creado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    completed_at = models.DateTimeField(_('fecha de finalización'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('respaldo')
        verbose_name_plural = _('respaldos')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.filename} ({self.created_at})"


class SystemHealth(models.Model):
    """
    Modelo para el estado de salud del sistema.
    """
    # Métricas del sistema
    cpu_usage = models.FloatField(_('uso de CPU'), default=0.0)
    memory_usage = models.FloatField(_('uso de memoria'), default=0.0)
    disk_usage = models.FloatField(_('uso de disco'), default=0.0)
    
    # Estadísticas de la base de datos
    db_size = models.BigIntegerField(_('tamaño de base de datos'), default=0)
    db_connections = models.PositiveIntegerField(_('conexiones a base de datos'), default=0)
    
    # Estadísticas de la aplicación
    active_users = models.PositiveIntegerField(_('usuarios activos'), default=0)
    response_time = models.FloatField(_('tiempo de respuesta'), default=0.0)
    
    # Estado general
    HEALTHY = 'healthy'
    WARNING = 'warning'
    CRITICAL = 'critical'
    
    STATUS_CHOICES = [
        (HEALTHY, _('Saludable')),
        (WARNING, _('Advertencia')),
        (CRITICAL, _('Crítico')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=HEALTHY
    )
    
    # Mensaje de estado
    status_message = models.TextField(_('mensaje de estado'), blank=True)
    
    # Fecha y hora del registro
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('estado del sistema')
        verbose_name_plural = _('estados del sistema')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Estado del sistema: {self.get_status_display()} ({self.created_at})"
