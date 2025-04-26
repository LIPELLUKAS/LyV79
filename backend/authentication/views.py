from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from django.conf import settings
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

from .serializers import (
    UserSerializer, UserCreateSerializer, PasswordChangeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    TwoFactorSetupSerializer, TwoFactorVerifySerializer
)

User = get_user_model()

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
            return Response(
                {'detail': 'Credenciales inválidas.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'detail': 'La cuenta está desactivada.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar si el usuario tiene 2FA habilitado
        if user.two_factor_enabled:
            return Response({
                'detail': 'Se requiere autenticación de dos factores.',
                'requires_2fa': True,
                'user_id': user.id
            }, status=status.HTTP_200_OK)
        
        # Si no tiene 2FA, generar tokens directamente
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
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
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                })
        
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
            
            return Response({'detail': 'Autenticación de dos factores activada correctamente.'})
        
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
        
        # En una implementación real, aquí se enviaría un correo con el token
        # Por ahora, solo devolvemos un mensaje de éxito
        
        return Response({
            'detail': 'Se ha enviado un enlace de restablecimiento a tu correo electrónico.'
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
        
        # En una implementación real, aquí se verificaría el token y se cambiaría la contraseña
        # Por ahora, solo devolvemos un mensaje de éxito
        
        return Response({
            'detail': 'Contraseña restablecida correctamente.'
        })
