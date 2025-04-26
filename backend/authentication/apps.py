from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class AuthenticationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'authentication'
    verbose_name = _('Autenticación y Usuarios')
    
    def ready(self):
        # Importar señales aquí para evitar problemas de importación circular
        import authentication.signals
