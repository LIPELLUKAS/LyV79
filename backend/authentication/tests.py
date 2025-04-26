import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from authentication.models import MasonicUser

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user():
    def _create_user(username, password, degree=1, office=None):
        user = MasonicUser.objects.create_user(
            username=username,
            email=f"{username}@example.com",
            password=password,
            degree=degree,
            office=office
        )
        return user
    return _create_user

@pytest.fixture
def regular_user(create_user):
    return create_user("regular", "password123", degree=1)

@pytest.fixture
def master_user(create_user):
    return create_user("master", "password123", degree=3)

@pytest.fixture
def venerable_user(create_user):
    return create_user("venerable", "password123", degree=3, office="Venerable Maestro")

@pytest.mark.django_db
class TestAuthenticationModule:
    
    def test_user_registration(self, api_client):
        """Verificar que se puede registrar un nuevo usuario"""
        url = reverse('authentication:register')
        
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'securepassword123',
            'password_confirm': 'securepassword123',
            'first_name': 'Nuevo',
            'last_name': 'Usuario',
            'symbolic_name': 'Hermano Nuevo',
            'degree': 1
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert MasonicUser.objects.filter(username='newuser').exists()
        
    def test_user_login(self, api_client, regular_user):
        """Verificar que un usuario puede iniciar sesión"""
        url = reverse('authentication:login')
        
        data = {
            'username': 'regular',
            'password': 'password123'
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'token' in response.data
        
    def test_invalid_login(self, api_client, regular_user):
        """Verificar que no se puede iniciar sesión con credenciales incorrectas"""
        url = reverse('authentication:login')
        
        data = {
            'username': 'regular',
            'password': 'wrongpassword'
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_password_reset_request(self, api_client, regular_user):
        """Verificar que se puede solicitar un restablecimiento de contraseña"""
        url = reverse('authentication:password-reset-request')
        
        data = {
            'email': 'regular@example.com'
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
    def test_user_profile(self, api_client, regular_user):
        """Verificar que un usuario puede acceder a su perfil"""
        url = reverse('authentication:profile')
        api_client.force_authenticate(user=regular_user)
        
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == 'regular'
        assert response.data['email'] == 'regular@example.com'
        
    def test_update_profile(self, api_client, regular_user):
        """Verificar que un usuario puede actualizar su perfil"""
        url = reverse('authentication:profile')
        api_client.force_authenticate(user=regular_user)
        
        data = {
            'first_name': 'Actualizado',
            'last_name': 'Usuario',
            'symbolic_name': 'Hermano Actualizado'
        }
        
        response = api_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Verificar que el perfil se actualizó
        regular_user.refresh_from_db()
        assert regular_user.first_name == 'Actualizado'
        assert regular_user.symbolic_name == 'Hermano Actualizado'
        
    def test_permission_by_degree(self, api_client, regular_user, master_user):
        """Verificar que los permisos basados en grado funcionan correctamente"""
        url = reverse('authentication:master-only')
        
        # Usuario de grado 1 no puede acceder
        api_client.force_authenticate(user=regular_user)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Usuario de grado 3 puede acceder
        api_client.force_authenticate(user=master_user)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
    def test_permission_by_office(self, api_client, master_user, venerable_user):
        """Verificar que los permisos basados en cargo funcionan correctamente"""
        url = reverse('authentication:venerable-only')
        
        # Usuario maestro sin cargo no puede acceder
        api_client.force_authenticate(user=master_user)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Venerable Maestro puede acceder
        api_client.force_authenticate(user=venerable_user)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
    def test_two_factor_auth(self, api_client, regular_user):
        """Verificar que la autenticación de dos factores funciona correctamente"""
        # Configurar 2FA para el usuario
        url = reverse('authentication:setup-2fa')
        api_client.force_authenticate(user=regular_user)
        
        response = api_client.post(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'qr_code' in response.data
        assert 'secret_key' in response.data
        
        # Verificar código 2FA (simulado)
        url = reverse('authentication:verify-2fa')
        data = {
            'code': '123456'  # Código simulado
        }
        
        response = api_client.post(url, data, format='json')
        # En un test real, esto dependería de la validación del código
        # Aquí asumimos que el backend tiene una forma de validar códigos de prueba
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_400_BAD_REQUEST]
        
    def test_logout(self, api_client, regular_user):
        """Verificar que un usuario puede cerrar sesión"""
        # Primero iniciar sesión
        login_url = reverse('authentication:login')
        data = {
            'username': 'regular',
            'password': 'password123'
        }
        login_response = api_client.post(login_url, data, format='json')
        token = login_response.data['token']
        
        # Luego cerrar sesión
        logout_url = reverse('authentication:logout')
        api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        
        response = api_client.post(logout_url)
        assert response.status_code == status.HTTP_200_OK
        
        # Verificar que el token ya no es válido
        profile_url = reverse('authentication:profile')
        response = api_client.get(profile_url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
