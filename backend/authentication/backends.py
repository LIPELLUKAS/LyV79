from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django_otp import match_token, devices_for_user

User = get_user_model()

class MasonicAuthBackend(ModelBackend):
    """
    Backend de autenticación personalizado para el Sistema de Gestión Masónica.
    Soporta autenticación estándar y verificación de autenticación de dos factores.
    """
    
    def authenticate(self, request, username=None, password=None, otp_token=None, **kwargs):
        """
        Autentica un usuario con nombre de usuario y contraseña, y opcionalmente con un token OTP.
        """
        try:
            # Primero verificamos las credenciales estándar
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return None
                
            # Si el usuario tiene 2FA habilitado, verificamos el token OTP
            if user.two_factor_enabled:
                if not otp_token:
                    # Si se requiere 2FA pero no se proporciona token, devolvemos None
                    # pero marcamos que se requiere 2FA
                    user.requires_2fa = True
                    return user
                
                # Verificar el token OTP con los dispositivos del usuario
                devices = devices_for_user(user)
                for device in devices:
                    if device.verify_token(otp_token):
                        # Token válido, autenticación completa
                        return user
                
                # Si llegamos aquí, el token OTP no es válido
                return None
            
            # Si no tiene 2FA habilitado, la autenticación es exitosa
            return user
            
        except User.DoesNotExist:
            return None
