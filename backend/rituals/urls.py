from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    RitualPlanViewSet, RitualRoleViewSet, RitualWorkViewSet,
    RitualMinutesViewSet, RitualAttachmentViewSet
)

router = DefaultRouter()
router.register(r'plans', RitualPlanViewSet)
router.register(r'roles', RitualRoleViewSet)
router.register(r'works', RitualWorkViewSet)
router.register(r'minutes', RitualMinutesViewSet)
router.register(r'attachments', RitualAttachmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
