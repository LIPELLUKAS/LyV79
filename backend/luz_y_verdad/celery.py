from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

# Establecer la variable de entorno para configuraciones de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'luz_y_verdad.settings')

# Crear la instancia de la aplicación Celery
app = Celery('luz_y_verdad')

# Configurar Celery usando la configuración de Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Cargar tareas de todas las aplicaciones Django registradas
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))
