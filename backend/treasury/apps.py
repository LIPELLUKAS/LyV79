from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _

class TreasuryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'treasury'
    verbose_name = _('Tesorería')
    
    def ready(self):
        # Importar señales aquí para evitar problemas de importación circular
        import treasury.signals
