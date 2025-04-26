from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    MemberViewSet, MemberDocumentViewSet, 
    MemberProgressViewSet, AttendanceViewSet
)

router = DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'documents', MemberDocumentViewSet)
router.register(r'progress', MemberProgressViewSet)
router.register(r'attendance', AttendanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
