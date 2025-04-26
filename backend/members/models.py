from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class MemberProfile(models.Model):
    """
    Perfil extendido para miembros de la Logia.
    Contiene información adicional que no está en el modelo de usuario base.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('usuario')
    )
    
    # Información personal adicional
    birth_date = models.DateField(_('fecha de nacimiento'), null=True, blank=True)
    profession = models.CharField(_('profesión'), max_length=100, blank=True)
    civil_id = models.CharField(_('documento de identidad'), max_length=20, blank=True)
    
    # Información masónica adicional
    mother_lodge = models.CharField(_('logia madre'), max_length=100, blank=True)
    masonic_id = models.CharField(_('número de registro masónico'), max_length=20, blank=True)
    
    # Contacto de emergencia
    emergency_contact_name = models.CharField(_('nombre de contacto de emergencia'), max_length=100, blank=True)
    emergency_contact_phone = models.CharField(_('teléfono de contacto de emergencia'), max_length=20, blank=True)
    emergency_contact_relation = models.CharField(_('relación con contacto de emergencia'), max_length=50, blank=True)
    
    # Seguimiento de asistencia
    last_attendance_date = models.DateField(_('fecha de última asistencia'), null=True, blank=True)
    attendance_count = models.PositiveIntegerField(_('conteo de asistencias'), default=0)
    
    # Campos para auditoría
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('perfil de miembro')
        verbose_name_plural = _('perfiles de miembros')
        permissions = [
            ('view_detailed_profile', 'Puede ver detalles completos del perfil'),
        ]
    
    def __str__(self):
        return f"Perfil de {self.user.symbolic_name or self.user.username}"


class MemberDocument(models.Model):
    """
    Documentos personales de los miembros (diplomas, certificados, etc.)
    """
    DIPLOMA = 'diploma'
    CERTIFICATE = 'certificate'
    ID_CARD = 'id_card'
    OTHER = 'other'
    
    DOCUMENT_TYPE_CHOICES = [
        (DIPLOMA, _('Diploma')),
        (CERTIFICATE, _('Certificado')),
        (ID_CARD, _('Carnet')),
        (OTHER, _('Otro')),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name=_('usuario')
    )
    title = models.CharField(_('título'), max_length=100)
    document_type = models.CharField(
        _('tipo de documento'),
        max_length=20,
        choices=DOCUMENT_TYPE_CHOICES,
        default=OTHER
    )
    file = models.FileField(_('archivo'), upload_to='member_documents/')
    description = models.TextField(_('descripción'), blank=True)
    issue_date = models.DateField(_('fecha de emisión'), null=True, blank=True)
    expiry_date = models.DateField(_('fecha de vencimiento'), null=True, blank=True)
    
    # Campos para auditoría
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_documents',
        verbose_name=_('subido por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('documento de miembro')
        verbose_name_plural = _('documentos de miembros')
        ordering = ['-issue_date', 'title']
    
    def __str__(self):
        return f"{self.title} - {self.user.symbolic_name or self.user.username}"


class MemberProgress(models.Model):
    """
    Registro del progreso masónico de los miembros.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress',
        verbose_name=_('usuario')
    )
    title = models.CharField(_('título'), max_length=100)
    description = models.TextField(_('descripción'))
    date = models.DateField(_('fecha'))
    
    # Campos opcionales
    ceremony_type = models.CharField(_('tipo de ceremonia'), max_length=100, blank=True)
    location = models.CharField(_('lugar'), max_length=100, blank=True)
    
    # Campos para auditoría
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_progress',
        verbose_name=_('registrado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('progreso de miembro')
        verbose_name_plural = _('progresos de miembros')
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.title} - {self.user.symbolic_name or self.user.username} ({self.date})"


class Attendance(models.Model):
    """
    Registro de asistencia a tenidas y eventos.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendances',
        verbose_name=_('usuario')
    )
    event = models.ForeignKey(
        'communications.Event',
        on_delete=models.CASCADE,
        related_name='attendances',
        verbose_name=_('evento')
    )
    is_present = models.BooleanField(_('presente'), default=True)
    excuse = models.TextField(_('excusa'), blank=True)
    
    # Campos para auditoría
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='recorded_attendances',
        verbose_name=_('registrado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('asistencia')
        verbose_name_plural = _('asistencias')
        unique_together = ['user', 'event']
        ordering = ['-event__date']
    
    def __str__(self):
        status = _('Presente') if self.is_present else _('Ausente')
        return f"{self.user.symbolic_name or self.user.username} - {self.event.title} - {status}"
