from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    EventViewSet, NotificationViewSet, MessageViewSet, CalendarViewSet
)

router = DefaultRouter()
router.register(r'events', EventViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'calendars', CalendarViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
