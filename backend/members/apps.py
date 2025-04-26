from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class MembersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'members'
    verbose_name = _('Gestión de Hermanos')
    
    def ready(self):
        # Importar señales aquí para evitar problemas de importación circular
        import members.signals
