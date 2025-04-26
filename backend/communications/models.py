from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Event(models.Model):
    """
    Modelo para eventos y tenidas de la Logia.
    """
    title = models.CharField(_('título'), max_length=200)
    description = models.TextField(_('descripción'), blank=True)
    
    # Fechas y horarios
    date = models.DateField(_('fecha'))
    start_time = models.TimeField(_('hora de inicio'))
    end_time = models.TimeField(_('hora de finalización'), null=True, blank=True)
    
    # Ubicación
    location = models.CharField(_('ubicación'), max_length=200, blank=True)
    is_virtual = models.BooleanField(_('es virtual'), default=False)
    virtual_link = models.URLField(_('enlace virtual'), blank=True)
    
    # Tipo de evento
    TENIDA = 'tenida'
    INSTRUCTION = 'instruction'
    CEREMONY = 'ceremony'
    SOCIAL = 'social'
    ADMINISTRATIVE = 'administrative'
    OTHER = 'other'
    
    EVENT_TYPE_CHOICES = [
        (TENIDA, _('Tenida Regular')),
        (INSTRUCTION, _('Instrucción')),
        (CEREMONY, _('Ceremonia')),
        (SOCIAL, _('Evento Social')),
        (ADMINISTRATIVE, _('Reunión Administrativa')),
        (OTHER, _('Otro')),
    ]
    
    event_type = models.CharField(
        _('tipo de evento'),
        max_length=20,
        choices=EVENT_TYPE_CHOICES,
        default=TENIDA
    )
    
    # Grado mínimo requerido para asistir
    required_degree = models.PositiveSmallIntegerField(
        _('grado requerido'),
        default=1,
        choices=[
            (1, _('Aprendiz')),
            (2, _('Compañero')),
            (3, _('Maestro')),
        ]
    )
    
    # Estado del evento
    SCHEDULED = 'scheduled'
    CANCELLED = 'cancelled'
    COMPLETED = 'completed'
    
    EVENT_STATUS_CHOICES = [
        (SCHEDULED, _('Programado')),
        (CANCELLED, _('Cancelado')),
        (COMPLETED, _('Completado')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=EVENT_STATUS_CHOICES,
        default=SCHEDULED
    )
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_events',
        verbose_name=_('creado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('evento')
        verbose_name_plural = _('eventos')
        ordering = ['-date', '-start_time']
    
    def __str__(self):
        return f"{self.title} ({self.date})"


class Notification(models.Model):
    """
    Modelo para notificaciones a los miembros.
    """
    title = models.CharField(_('título'), max_length=200)
    content = models.TextField(_('contenido'))
    
    # Tipo de notificación
    GENERAL = 'general'
    IMPORTANT = 'important'
    EVENT = 'event'
    PAYMENT = 'payment'
    RITUAL = 'ritual'
    ADMINISTRATIVE = 'administrative'
    
    NOTIFICATION_TYPE_CHOICES = [
        (GENERAL, _('General')),
        (IMPORTANT, _('Importante')),
        (EVENT, _('Evento')),
        (PAYMENT, _('Pago')),
        (RITUAL, _('Ritual')),
        (ADMINISTRATIVE, _('Administrativa')),
    ]
    
    notification_type = models.CharField(
        _('tipo de notificación'),
        max_length=20,
        choices=NOTIFICATION_TYPE_CHOICES,
        default=GENERAL
    )
    
    # Destinatarios
    recipients = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='notifications',
        verbose_name=_('destinatarios'),
        through='NotificationRecipient'
    )
    
    # Evento relacionado (opcional)
    event = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_('evento relacionado')
    )
    
    # Fechas
    send_date = models.DateTimeField(_('fecha de envío'), auto_now_add=True)
    expiry_date = models.DateTimeField(_('fecha de expiración'), null=True, blank=True)
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_notifications',
        verbose_name=_('creada por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('notificación')
        verbose_name_plural = _('notificaciones')
        ordering = ['-send_date']
    
    def __str__(self):
        return self.title


class NotificationRecipient(models.Model):
    """
    Modelo para la relación entre notificaciones y destinatarios.
    """
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='recipient_statuses',
        verbose_name=_('notificación')
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_statuses',
        verbose_name=_('destinatario')
    )
    read = models.BooleanField(_('leída'), default=False)
    read_date = models.DateTimeField(_('fecha de lectura'), null=True, blank=True)
    
    class Meta:
        verbose_name = _('destinatario de notificación')
        verbose_name_plural = _('destinatarios de notificación')
        unique_together = ['notification', 'recipient']
    
    def __str__(self):
        return f"{self.notification.title} - {self.recipient.symbolic_name or self.recipient.username}"


class Message(models.Model):
    """
    Modelo para mensajes internos entre miembros.
    """
    subject = models.CharField(_('asunto'), max_length=200)
    content = models.TextField(_('contenido'))
    
    # Remitente y destinatarios
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_('remitente')
    )
    recipients = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='received_messages',
        verbose_name=_('destinatarios'),
        through='MessageRecipient'
    )
    
    # Fechas
    send_date = models.DateTimeField(_('fecha de envío'), auto_now_add=True)
    
    # Estado del mensaje
    is_draft = models.BooleanField(_('es borrador'), default=False)
    
    # Campos para auditoría
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('mensaje')
        verbose_name_plural = _('mensajes')
        ordering = ['-send_date']
    
    def __str__(self):
        return self.subject


class MessageRecipient(models.Model):
    """
    Modelo para la relación entre mensajes y destinatarios.
    """
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='recipient_statuses',
        verbose_name=_('mensaje')
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='message_statuses',
        verbose_name=_('destinatario')
    )
    read = models.BooleanField(_('leído'), default=False)
    read_date = models.DateTimeField(_('fecha de lectura'), null=True, blank=True)
    archived = models.BooleanField(_('archivado'), default=False)
    starred = models.BooleanField(_('destacado'), default=False)
    
    class Meta:
        verbose_name = _('destinatario de mensaje')
        verbose_name_plural = _('destinatarios de mensaje')
        unique_together = ['message', 'recipient']
    
    def __str__(self):
        return f"{self.message.subject} - {self.recipient.symbolic_name or self.recipient.username}"


class Calendar(models.Model):
    """
    Modelo para calendarios masónicos.
    """
    title = models.CharField(_('título'), max_length=100)
    description = models.TextField(_('descripción'), blank=True)
    
    # Tipo de calendario
    REGULAR = 'regular'
    RITUAL = 'ritual'
    ADMINISTRATIVE = 'administrative'
    SPECIAL = 'special'
    
    CALENDAR_TYPE_CHOICES = [
        (REGULAR, _('Regular')),
        (RITUAL, _('Ritual')),
        (ADMINISTRATIVE, _('Administrativo')),
        (SPECIAL, _('Especial')),
    ]
    
    calendar_type = models.CharField(
        _('tipo de calendario'),
        max_length=20,
        choices=CALENDAR_TYPE_CHOICES,
        default=REGULAR
    )
    
    # Período
    year = models.PositiveIntegerField(_('año'))
    start_date = models.DateField(_('fecha de inicio'))
    end_date = models.DateField(_('fecha de fin'))
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_calendars',
        verbose_name=_('creado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('calendario')
        verbose_name_plural = _('calendarios')
        ordering = ['-year', '-start_date']
    
    def __str__(self):
        return f"{self.title} ({self.year})"


class CalendarEvent(models.Model):
    """
    Modelo para eventos en el calendario.
    """
    calendar = models.ForeignKey(
        Calendar,
        on_delete=models.CASCADE,
        related_name='events',
        verbose_name=_('calendario')
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='calendar_entries',
        verbose_name=_('evento')
    )
    
    # Campos adicionales específicos del calendario
    notes = models.TextField(_('notas'), blank=True)
    is_highlighted = models.BooleanField(_('destacado'), default=False)
    
    class Meta:
        verbose_name = _('evento de calendario')
        verbose_name_plural = _('eventos de calendario')
        unique_together = ['calendar', 'event']
    
    def __str__(self):
        return f"{self.event.title} - {self.calendar.title}"
