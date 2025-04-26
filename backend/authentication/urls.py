from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    UserViewSet, LoginView, TwoFactorVerifyView, TwoFactorSetupView,
    PasswordResetRequestView, PasswordResetConfirmView
)

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', LoginView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('two-factor/verify/', TwoFactorVerifyView.as_view(), name='two_factor_verify'),
    path('two-factor/setup/', TwoFactorSetupView.as_view(), name='two_factor_setup'),
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
