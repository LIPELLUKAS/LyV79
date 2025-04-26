from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DocumentCategoryViewSet, DocumentViewSet, DocumentCommentViewSet,
    DocumentRatingViewSet, DocumentAccessViewSet
)

router = DefaultRouter()
router.register(r'categories', DocumentCategoryViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'comments', DocumentCommentViewSet)
router.register(r'ratings', DocumentRatingViewSet)
router.register(r'accesses', DocumentAccessViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
