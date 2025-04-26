from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LodgeConfigurationViewSet, SystemLogViewSet, BackupConfigurationViewSet,
    BackupViewSet, SystemHealthViewSet
)

router = DefaultRouter()
router.register(r'configuration', LodgeConfigurationViewSet)
router.register(r'logs', SystemLogViewSet)
router.register(r'backup-configuration', BackupConfigurationViewSet)
router.register(r'backups', BackupViewSet)
router.register(r'health', SystemHealthViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
