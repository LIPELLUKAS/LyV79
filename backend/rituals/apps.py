from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class RitualsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'rituals'
    verbose_name = _('Planificación Ritual')
    
    def ready(self):
        # Importar señales aquí para evitar problemas de importación circular
        import rituals.signals
