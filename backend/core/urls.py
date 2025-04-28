from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .views import (
    LodgeConfigurationViewSet, SystemLogViewSet, BackupConfigurationViewSet,
    BackupViewSet, SystemHealthViewSet
)

# Vista simple para la raíz de /api/core/
class CoreApiRootView(APIView):
    def get(self, request, format=None):
        return Response({
            'message': 'Bienvenido a la API del módulo Core',
            'endpoints': {
                'configuration': request.build_absolute_uri('configuration/'),
                'logs': request.build_absolute_uri('logs/'),
                'backup-configuration': request.build_absolute_uri('backup-configuration/'),
                'backups': request.build_absolute_uri('backups/'),
                'health': request.build_absolute_uri('health/'),
            }
        })

router = DefaultRouter()
router.register(r'configuration', LodgeConfigurationViewSet)
router.register(r'logs', SystemLogViewSet)
router.register(r'backup-configuration', BackupConfigurationViewSet)
router.register(r'backups', BackupViewSet)
router.register(r'health', SystemHealthViewSet)

urlpatterns = [
    path('', CoreApiRootView.as_view(), name='core-api-root'), # Añadir vista raíz para /api/core/
    path('', include(router.urls)),
]
