from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class RitualPlan(models.Model):
    """
    Modelo para la planificación de trabajos rituales.
    """
    title = models.CharField(_('título'), max_length=200)
    description = models.TextField(_('descripción'), blank=True)
    
    # Fechas
    date = models.DateField(_('fecha'))
    start_time = models.TimeField(_('hora de inicio'))
    end_time = models.TimeField(_('hora de finalización'), null=True, blank=True)
    
    # Tipo de ritual
    REGULAR = 'regular'
    INITIATION = 'initiation'
    PASSING = 'passing'
    RAISING = 'raising'
    INSTALLATION = 'installation'
    SPECIAL = 'special'
    
    RITUAL_TYPE_CHOICES = [
        (REGULAR, _('Tenida Regular')),
        (INITIATION, _('Iniciación')),
        (PASSING, _('Pase de Grado')),
        (RAISING, _('Exaltación')),
        (INSTALLATION, _('Instalación de Oficiales')),
        (SPECIAL, _('Ceremonia Especial')),
    ]
    
    ritual_type = models.CharField(
        _('tipo de ritual'),
        max_length=20,
        choices=RITUAL_TYPE_CHOICES,
        default=REGULAR
    )
    
    # Grado del trabajo
    degree = models.PositiveSmallIntegerField(
        _('grado'),
        default=1,
        choices=[
            (1, _('Aprendiz')),
            (2, _('Compañero')),
            (3, _('Maestro')),
        ]
    )
    
    # Estado del plan ritual
    DRAFT = 'draft'
    APPROVED = 'approved'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (DRAFT, _('Borrador')),
        (APPROVED, _('Aprobado')),
        (COMPLETED, _('Completado')),
        (CANCELLED, _('Cancelado')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT
    )
    
    # Evento asociado (opcional)
    event = models.OneToOneField(
        'communications.Event',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ritual_plan',
        verbose_name=_('evento asociado')
    )
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_ritual_plans',
        verbose_name=_('creado por')
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_ritual_plans',
        verbose_name=_('aprobado por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('plan ritual')
        verbose_name_plural = _('planes rituales')
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.date}"


class RitualRole(models.Model):
    """
    Modelo para los roles en un trabajo ritual.
    """
    ritual_plan = models.ForeignKey(
        RitualPlan,
        on_delete=models.CASCADE,
        related_name='roles',
        verbose_name=_('plan ritual')
    )
    
    # Tipo de rol
    WORSHIPFUL_MASTER = 'vm'
    SENIOR_WARDEN = 'pv'
    JUNIOR_WARDEN = 'sv'
    SECRETARY = 'sec'
    TREASURER = 'tes'
    SENIOR_DEACON = 'pd'
    JUNIOR_DEACON = 'sd'
    INNER_GUARD = 'gi'
    TYLER = 'gt'
    CHAPLAIN = 'cap'
    ORATOR = 'ora'
    MASTER_OF_CEREMONIES = 'mce'
    EXPERT = 'exp'
    HOSPITALLER = 'hos'
    MUSICIAN = 'mus'
    OTHER = 'other'
    
    ROLE_TYPE_CHOICES = [
        (WORSHIPFUL_MASTER, _('Venerable Maestro')),
        (SENIOR_WARDEN, _('Primer Vigilante')),
        (JUNIOR_WARDEN, _('Segundo Vigilante')),
        (SECRETARY, _('Secretario')),
        (TREASURER, _('Tesorero')),
        (SENIOR_DEACON, _('Primer Diácono')),
        (JUNIOR_DEACON, _('Segundo Diácono')),
        (INNER_GUARD, _('Guarda Templo Interior')),
        (TYLER, _('Guarda Templo Exterior')),
        (CHAPLAIN, _('Capellán')),
        (ORATOR, _('Orador')),
        (MASTER_OF_CEREMONIES, _('Maestro de Ceremonias')),
        (EXPERT, _('Experto')),
        (HOSPITALLER, _('Hospitalario')),
        (MUSICIAN, _('Músico')),
        (OTHER, _('Otro')),
    ]
    
    role_type = models.CharField(
        _('tipo de rol'),
        max_length=10,
        choices=ROLE_TYPE_CHOICES
    )
    
    # Rol personalizado (si es "Otro")
    custom_role = models.CharField(_('rol personalizado'), max_length=100, blank=True)
    
    # Miembro asignado al rol
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ritual_roles',
        verbose_name=_('asignado a')
    )
    
    # Notas sobre el rol
    notes = models.TextField(_('notas'), blank=True)
    
    # Estado de confirmación
    is_confirmed = models.BooleanField(_('confirmado'), default=False)
    
    class Meta:
        verbose_name = _('rol ritual')
        verbose_name_plural = _('roles rituales')
        ordering = ['ritual_plan', 'role_type']
        unique_together = ['ritual_plan', 'role_type']
    
    def __str__(self):
        role_name = self.get_role_type_display()
        if self.role_type == self.OTHER and self.custom_role:
            role_name = self.custom_role
        
        assigned_name = "No asignado"
        if self.assigned_to:
            assigned_name = self.assigned_to.symbolic_name or self.assigned_to.username
        
        return f"{role_name} - {assigned_name}"


class RitualWork(models.Model):
    """
    Modelo para los trabajos específicos dentro de un ritual.
    """
    ritual_plan = models.ForeignKey(
        RitualPlan,
        on_delete=models.CASCADE,
        related_name='works',
        verbose_name=_('plan ritual')
    )
    title = models.CharField(_('título'), max_length=200)
    description = models.TextField(_('descripción'), blank=True)
    
    # Tipo de trabajo
    LECTURE = 'lecture'
    CEREMONY = 'ceremony'
    DISCUSSION = 'discussion'
    PRESENTATION = 'presentation'
    OTHER = 'other'
    
    WORK_TYPE_CHOICES = [
        (LECTURE, _('Plancha')),
        (CEREMONY, _('Ceremonia')),
        (DISCUSSION, _('Discusión')),
        (PRESENTATION, _('Presentación')),
        (OTHER, _('Otro')),
    ]
    
    work_type = models.CharField(
        _('tipo de trabajo'),
        max_length=20,
        choices=WORK_TYPE_CHOICES,
        default=LECTURE
    )
    
    # Miembro responsable del trabajo
    responsible = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ritual_works',
        verbose_name=_('responsable')
    )
    
    # Duración estimada (en minutos)
    estimated_duration = models.PositiveIntegerField(_('duración estimada (minutos)'), default=15)
    
    # Orden en la agenda
    order = models.PositiveIntegerField(_('orden'), default=1)
    
    # Documento adjunto (opcional)
    attachment = models.FileField(_('adjunto'), upload_to='ritual_works/', null=True, blank=True)
    
    # Estado del trabajo
    PENDING = 'pending'
    CONFIRMED = 'confirmed'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    
    STATUS_CHOICES = [
        (PENDING, _('Pendiente')),
        (CONFIRMED, _('Confirmado')),
        (COMPLETED, _('Completado')),
        (CANCELLED, _('Cancelado')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING
    )
    
    class Meta:
        verbose_name = _('trabajo ritual')
        verbose_name_plural = _('trabajos rituales')
        ordering = ['ritual_plan', 'order']
    
    def __str__(self):
        return f"{self.title} - {self.get_work_type_display()}"


class RitualMinutes(models.Model):
    """
    Modelo para las actas de los trabajos rituales.
    """
    ritual_plan = models.OneToOneField(
        RitualPlan,
        on_delete=models.CASCADE,
        related_name='minutes',
        verbose_name=_('plan ritual')
    )
    
    # Contenido del acta
    content = models.TextField(_('contenido'))
    
    # Asistencia
    attendance_count = models.PositiveIntegerField(_('número de asistentes'), default=0)
    visitors_count = models.PositiveIntegerField(_('número de visitantes'), default=0)
    
    # Estado del acta
    DRAFT = 'draft'
    FINALIZED = 'finalized'
    APPROVED = 'approved'
    
    STATUS_CHOICES = [
        (DRAFT, _('Borrador')),
        (FINALIZED, _('Finalizada')),
        (APPROVED, _('Aprobada')),
    ]
    
    status = models.CharField(
        _('estado'),
        max_length=20,
        choices=STATUS_CHOICES,
        default=DRAFT
    )
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_minutes',
        verbose_name=_('creada por')
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_minutes',
        verbose_name=_('aprobada por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('acta ritual')
        verbose_name_plural = _('actas rituales')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Acta - {self.ritual_plan.title} ({self.ritual_plan.date})"


class RitualAttachment(models.Model):
    """
    Modelo para los adjuntos de los trabajos rituales.
    """
    ritual_plan = models.ForeignKey(
        RitualPlan,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name=_('plan ritual')
    )
    title = models.CharField(_('título'), max_length=200)
    description = models.TextField(_('descripción'), blank=True)
    
    # Tipo de adjunto
    LECTURE = 'lecture'
    CEREMONY_SCRIPT = 'ceremony_script'
    MUSIC = 'music'
    IMAGE = 'image'
    DIAGRAM = 'diagram'
    OTHER = 'other'
    
    ATTACHMENT_TYPE_CHOICES = [
        (LECTURE, _('Plancha')),
        (CEREMONY_SCRIPT, _('Guión de Ceremonia')),
        (MUSIC, _('Música')),
        (IMAGE, _('Imagen')),
        (DIAGRAM, _('Diagrama')),
        (OTHER, _('Otro')),
    ]
    
    attachment_type = models.CharField(
        _('tipo de adjunto'),
        max_length=20,
        choices=ATTACHMENT_TYPE_CHOICES,
        default=OTHER
    )
    
    # Archivo adjunto
    file = models.FileField(_('archivo'), upload_to='ritual_attachments/')
    
    # Campos para auditoría
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_ritual_attachments',
        verbose_name=_('subido por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('adjunto ritual')
        verbose_name_plural = _('adjuntos rituales')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_attachment_type_display()}"
