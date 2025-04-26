from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Setting, Log
import json

class SettingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear configuraciones
        self.setting = Setting.objects.create(
            key='organization_name',
            value='Logia Luz y Verdad',
            description='Nombre de la organización'
        )

    def test_get_settings(self):
        """Test retrieving a list of settings"""
        url = reverse('setting-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['key'], 'organization_name')
        self.assertEqual(response.data[0]['value'], 'Logia Luz y Verdad')

    def test_get_setting_detail(self):
        """Test retrieving a specific setting"""
        url = reverse('setting-detail', args=[self.setting.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['key'], 'organization_name')
        self.assertEqual(response.data['value'], 'Logia Luz y Verdad')

    def test_create_setting(self):
        """Test creating a new setting"""
        url = reverse('setting-list')
        setting_data = {
            'key': 'organization_address',
            'value': 'Calle Principal 123',
            'description': 'Dirección de la organización'
        }
        response = self.client.post(
            url, 
            data=json.dumps(setting_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Setting.objects.count(), 2)
        self.assertEqual(Setting.objects.latest('id').key, 'organization_address')
        self.assertEqual(Setting.objects.latest('id').value, 'Calle Principal 123')

    def test_update_setting(self):
        """Test updating a setting"""
        url = reverse('setting-detail', args=[self.setting.id])
        updated_data = {
            'value': 'Respetable Logia Luz y Verdad'
        }
        response = self.client.patch(
            url, 
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.setting.refresh_from_db()
        self.assertEqual(self.setting.value, 'Respetable Logia Luz y Verdad')

    def test_delete_setting(self):
        """Test deleting a setting"""
        url = reverse('setting-detail', args=[self.setting.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Setting.objects.count(), 0)


class LogTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword',
            is_staff=True
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear logs
        self.log = Log.objects.create(
            action='login',
            user=self.user,
            details='User logged in',
            ip_address='127.0.0.1'
        )

    def test_get_logs(self):
        """Test retrieving a list of logs"""
        url = reverse('log-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['action'], 'login')
        self.assertEqual(response.data[0]['details'], 'User logged in')

    def test_get_log_detail(self):
        """Test retrieving a specific log"""
        url = reverse('log-detail', args=[self.log.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['action'], 'login')
        self.assertEqual(response.data['details'], 'User logged in')

    def test_create_log(self):
        """Test creating a new log"""
        url = reverse('log-list')
        log_data = {
            'action': 'update',
            'details': 'User updated profile',
            'ip_address': '127.0.0.1'
        }
        response = self.client.post(
            url, 
            data=json.dumps(log_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Log.objects.count(), 2)
        self.assertEqual(Log.objects.latest('id').action, 'update')
        self.assertEqual(Log.objects.latest('id').details, 'User updated profile')

    def test_filter_logs_by_action(self):
        """Test filtering logs by action"""
        # Crear otro log con acción diferente
        Log.objects.create(
            action='logout',
            user=self.user,
            details='User logged out',
            ip_address='127.0.0.1'
        )
        
        url = reverse('log-list') + '?action=login'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['action'], 'login')
        
        url = reverse('log-list') + '?action=logout'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['action'], 'logout')

    def test_filter_logs_by_date_range(self):
        """Test filtering logs by date range"""
        # Crear otro log con fecha diferente (simulada)
        old_log = Log.objects.create(
            action='view',
            user=self.user,
            details='User viewed page',
            ip_address='127.0.0.1'
        )
        # Modificar la fecha manualmente (esto es solo para la prueba)
        old_log.timestamp = '2020-01-01T00:00:00Z'
        old_log.save()
        
        # Filtrar por fecha reciente (debería incluir solo el log original)
        today = '2025-04-26'
        url = reverse('log-list') + f'?start_date={today}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['action'], 'login')
        
        # Filtrar por rango que incluya ambos
        url = reverse('log-list') + '?start_date=2020-01-01&end_date=2025-12-31'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_non_staff_cannot_access_logs(self):
        """Test that non-staff users cannot access logs"""
        # Crear usuario sin permisos de staff
        regular_user = User.objects.create_user(
            username='regularuser',
            email='regular@example.com',
            password='regularpassword',
            is_staff=False
        )
        self.client.force_authenticate(user=regular_user)
        
        url = reverse('log-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
