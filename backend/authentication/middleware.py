from django.contrib.auth.middleware import AuthenticationMiddleware
from django.utils.functional import SimpleLazyObject
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request

User = get_user_model()

def get_user_jwt(request):
    """
    Obtiene el usuario autenticado a partir del token JWT en la solicitud.
    """
    user = None
    jwt_auth = JWTAuthentication()
    
    try:
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if auth_header and auth_header.startswith('Bearer '):
            validated_token = jwt_auth.get_validated_token(auth_header.split(' ')[1])
            user = jwt_auth.get_user(validated_token)
    except Exception:
        pass
    
    return user or request.user

class JWTAuthenticationMiddleware(AuthenticationMiddleware):
    """
    Middleware para autenticación JWT.
    Extiende el middleware de autenticación estándar de Django para soportar tokens JWT.
    """
    
    def process_request(self, request):
        # Primero, ejecutamos el middleware de autenticación estándar
        super().process_request(request)
        
        # Luego, intentamos autenticar con JWT si es necesario
        if not request.user.is_authenticated:
            request.user = SimpleLazyObject(lambda: get_user_jwt(request))

class RoleAndPermissionMiddleware:
    """
    Middleware para verificar roles y permisos basados en grados masónicos.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Procesar la solicitud antes de la vista
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Añadir información sobre el grado masónico y cargo oficial al request
            request.masonic_degree = request.user.degree
            request.is_officer = request.user.is_officer()
            
            # Añadir información sobre permisos específicos
            request.can_view_master_content = request.user.degree >= User.MASTER
            request.can_view_fellow_content = request.user.degree >= User.FELLOW_CRAFT
            
            # Verificar si es un oficial con cargo específico
            if request.is_officer:
                officer_role = request.user.officer_role
                request.officer_role = officer_role.get_role_display()
                request.is_worshipful_master = officer_role.role == 'VM'
                request.is_warden = officer_role.role in ['PV', 'SV']
                request.is_secretary = officer_role.role == 'SEC'
                request.is_treasurer = officer_role.role == 'TES'
        
        # Continuar con el procesamiento de la solicitud
        response = self.get_response(request)
        
        return response
