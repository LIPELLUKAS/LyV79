from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_otp import devices_for_user
from django_otp.plugins.otp_totp.models import TOTPDevice
import pyotp
import qrcode
import io
import base64
import logging

from .serializers import (
    UserSerializer, UserCreateSerializer, PasswordChangeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    TwoFactorSetupSerializer, TwoFactorVerifySerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar usuarios.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Devuelve la información del usuario autenticado.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], serializer_class=PasswordChangeSerializer)
    def change_password(self, request, pk=None):
        """
        Cambia la contraseña del usuario.
        """
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'Contraseña actualizada'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    API endpoint para iniciar sesión.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'detail': 'Se requieren nombre de usuario y contraseña.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=username, password=password)
        
        if not user:
            logger.warning(f"Intento de inicio de sesión fallido para el usuario: {username}")
            return Response(
                {'detail': 'Credenciales inválidas.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            logger.warning(f"Intento de inicio de sesión con cuenta desactivada: {username}")
            return Response(
                {'detail': 'La cuenta está desactivada.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar si el usuario tiene 2FA habilitado
        if user.two_factor_enabled:
            logger.info(f"Solicitando verificación 2FA para usuario: {username}")
            return Response({
                'detail': 'Se requiere autenticación de dos factores.',
                'requires_2fa': True,
                'user_id': user.id
            }, status=status.HTTP_200_OK)
        
        # Si no tiene 2FA, generar tokens directamente
        refresh = RefreshToken.for_user(user)
        
        # Registrar inicio de sesión exitoso
        logger.info(f"Inicio de sesión exitoso para usuario: {username}")
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_admin': user.is_superuser,
                'degree': user.degree,
                'symbolic_name': user.symbolic_name
            }
        })

class TwoFactorVerifyView(APIView):
    """
    API endpoint para verificar el código de autenticación de dos factores.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        user_id = request.data.get('user_id')
        code = request.data.get('code')
        
        if not user_id or not code:
            return Response(
                {'detail': 'Se requieren ID de usuario y código.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.warning(f"Intento de verificación 2FA para usuario inexistente ID: {user_id}")
            return Response(
                {'detail': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar el código 2FA
        devices = devices_for_user(user)
        for device in devices:
            if device.verify_token(code):
                # Código válido, generar tokens
                refresh = RefreshToken.for_user(user)
                logger.info(f"Verificación 2FA exitosa para usuario: {user.username}")
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'is_staff': user.is_staff,
                        'is_admin': user.is_superuser,
                        'degree': user.degree,
                        'symbolic_name': user.symbolic_name
                    }
                })
        
        logger.warning(f"Código 2FA inválido para usuario: {user.username}")
        return Response(
            {'detail': 'Código inválido.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

class TwoFactorSetupView(APIView):
    """
    API endpoint para configurar la autenticación de dos factores.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """
        Genera una nueva clave secreta y devuelve un código QR.
        """
        user = request.user
        
        # Eliminar dispositivos existentes
        devices = TOTPDevice.objects.filter(user=user)
        devices.delete()
        
        # Crear un nuevo dispositivo
        secret_key = pyotp.random_base32()
        device = TOTPDevice.objects.create(
            user=user,
            name=f"TOTP Device for {user.username}",
            confirmed=False,
            key=secret_key
        )
        
        # Generar URI para código QR
        totp = pyotp.TOTP(secret_key)
        uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="Sistema Masónico Luz y Verdad"
        )
        
        # Generar imagen QR
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        logger.info(f"Configuración 2FA iniciada para usuario: {user.username}")
        return Response({
            'secret_key': secret_key,
            'qr_code': f"data:image/png;base64,{qr_code_base64}"
        })
    
    def post(self, request):
        """
        Verifica el código proporcionado y activa 2FA.
        """
        serializer = TwoFactorVerifySerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        code = serializer.validated_data['code']
        
        # Buscar dispositivo no confirmado
        try:
            device = TOTPDevice.objects.get(user=user, confirmed=False)
        except TOTPDevice.DoesNotExist:
            logger.warning(f"No se encontró dispositivo 2FA pendiente para usuario: {user.username}")
            return Response(
                {'detail': 'No se encontró un dispositivo pendiente de confirmación.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar código
        totp = pyotp.TOTP(device.key)
        if totp.verify(code):
            device.confirmed = True
            device.save()
            
            # Activar 2FA para el usuario
            user.two_factor_enabled = True
            user.save()
            
            logger.info(f"2FA activado correctamente para usuario: {user.username}")
            return Response({'detail': 'Autenticación de dos factores activada correctamente.'})
        
        logger.warning(f"Código de verificación 2FA inválido para usuario: {user.username}")
        return Response(
            {'detail': 'Código inválido.'},
            status=status.HTTP_400_BAD_REQUEST
        )

class PasswordResetRequestView(APIView):
    """
    API endpoint para solicitar restablecimiento de contraseña.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        # Buscar usuario por email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # No revelar si el email existe o no por seguridad
            logger.warning(f"Intento de recuperación de contraseña para email no registrado: {email}")
            return Response({
                'detail': 'Se ha enviado un enlace de restablecimiento a tu correo electrónico si está registrado en nuestro sistema.'
            })
        
        # Generar token de restablecimiento
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Construir URL de restablecimiento
        reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}/"
        
        # Preparar correo
        subject = 'Restablecimiento de contraseña - Sistema Masónico Luz y Verdad'
        html_message = render_to_string('password_reset_email.html', {
            'user': user,
            'reset_url': reset_url,
            'valid_hours': 24,
        })
        plain_message = f"""
        Hola {user.first_name or user.username},
        
        Has solicitado restablecer tu contraseña en el Sistema Masónico Luz y Verdad.
        
        Por favor, haz clic en el siguiente enlace para crear una nueva contraseña:
        {reset_url}
        
        Este enlace es válido por 24 horas.
        
        Si no has solicitado este cambio, puedes ignorar este correo.
        
        Fraternalmente,
        Sistema Masónico Luz y Verdad
        """
        
        try:
            # Enviar correo
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            logger.info(f"Correo de recuperación de contraseña enviado a: {email}")
        except Exception as e:
            logger.error(f"Error al enviar correo de recuperación: {str(e)}")
            return Response({
                'detail': 'Error al enviar el correo de restablecimiento. Por favor, intenta nuevamente más tarde.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'detail': 'Se ha enviado un enlace de restablecimiento a tu correo electrónico si está registrado en nuestro sistema.'
        })

class PasswordResetConfirmView(APIView):
    """
    API endpoint para confirmar restablecimiento de contraseña.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtener datos validados
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        password = serializer.validated_data['password']
        
        try:
            # Decodificar UID para obtener el ID del usuario
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            logger.warning(f"Intento de restablecimiento de contraseña con UID inválido: {uid}")
            return Response({
                'detail': 'Enlace de restablecimiento inválido.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verificar token
        if not default_token_generator.check_token(user, token):
            logger.warning(f"Intento de restablecimiento de contraseña con token inválido para usuario: {user.username}")
            return Response({
                'detail': 'El enlace de restablecimiento es inválido o ha expirado.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Cambiar contraseña
        user.set_password(password)
        user.save()
        
        logger.info(f"Contraseña restablecida correctamente para usuario: {user.username}")
        return Response({
            'detail': 'Contraseña restablecida correctamente.'
        })
