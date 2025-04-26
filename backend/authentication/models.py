from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _
from django.conf import settings

class MasonicUser(AbstractUser):
    """
    Modelo de usuario personalizado para el Sistema de Gestión Masónica.
    Extiende el modelo de usuario de Django para incluir campos específicos.
    """
    # Nombre simbólico del Hermano
    symbolic_name = models.CharField(_('nombre simbólico'), max_length=100, blank=True)
    
    # Grado masónico (1=Aprendiz, 2=Compañero, 3=Maestro)
    APPRENTICE = 1
    FELLOW_CRAFT = 2
    MASTER = 3
    DEGREE_CHOICES = [
        (APPRENTICE, _('Aprendiz')),
        (FELLOW_CRAFT, _('Compañero')),
        (MASTER, _('Maestro')),
    ]
    degree = models.PositiveSmallIntegerField(
        _('grado masónico'),
        choices=DEGREE_CHOICES,
        default=APPRENTICE
    )
    
    # Fechas importantes
    initiation_date = models.DateField(_('fecha de iniciación'), null=True, blank=True)
    passing_date = models.DateField(_('fecha de elevación'), null=True, blank=True)
    raising_date = models.DateField(_('fecha de exaltación'), null=True, blank=True)
    
    # Información de contacto adicional
    phone_number = models.CharField(_('número de teléfono'), max_length=20, blank=True)
    address = models.TextField(_('dirección'), blank=True)
    
    # Configuración de autenticación de dos factores
    two_factor_enabled = models.BooleanField(_('autenticación de dos factores activada'), default=False)
    
    # Campos para auditoría
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('usuario')
        verbose_name_plural = _('usuarios')
        swappable = 'AUTH_USER_MODEL'
        
    def __str__(self):
        return f"{self.symbolic_name or self.username} ({self.get_degree_display()})"
    
    def is_officer(self):
        """Verifica si el usuario tiene algún cargo oficial en la Logia."""
        return hasattr(self, 'officer_role') and self.officer_role is not None


class OfficerRole(models.Model):
    """
    Modelo para los cargos oficiales dentro de la Logia.
    """
    # Tipos de cargos
    WORSHIPFUL_MASTER = 'VM'
    SENIOR_WARDEN = 'PV'
    JUNIOR_WARDEN = 'SV'
    SECRETARY = 'SEC'
    TREASURER = 'TES'
    ROLE_CHOICES = [
        (WORSHIPFUL_MASTER, _('Venerable Maestro')),
        (SENIOR_WARDEN, _('Primer Vigilante')),
        (JUNIOR_WARDEN, _('Segundo Vigilante')),
        (SECRETARY, _('Secretario')),
        (TREASURER, _('Tesorero')),
        # Otros cargos pueden ser añadidos aquí
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='officer_role',
        verbose_name=_('usuario')
    )
    role = models.CharField(
        _('cargo'),
        max_length=3,
        choices=ROLE_CHOICES
    )
    start_date = models.DateField(_('fecha de inicio'))
    end_date = models.DateField(_('fecha de fin'), null=True, blank=True)
    is_active = models.BooleanField(_('activo'), default=True)
    
    class Meta:
        verbose_name = _('cargo oficial')
        verbose_name_plural = _('cargos oficiales')
        
    def __str__(self):
        return f"{self.get_role_display()} - {self.user.symbolic_name or self.user.username}"
