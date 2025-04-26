from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Ritual, Attendance
import json
from datetime import datetime, timedelta

class RitualTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear un ritual futuro
        future_date = datetime.now() + timedelta(days=7)
        self.ritual_data = {
            'title': 'Test Ritual',
            'date': future_date.isoformat(),
            'degree': 'Maestro',
            'location': 'Templo Principal',
            'description': 'This is a test ritual',
            'status': 'scheduled'
        }
        
        # Crear un ritual existente
        self.ritual = Ritual.objects.create(
            title='Existing Ritual',
            date=future_date,
            degree='Aprendiz',
            location='Templo Secundario',
            description='This is an existing ritual',
            status='scheduled',
            organizer=self.user
        )

    def test_create_ritual(self):
        """Test creating a new ritual"""
        url = reverse('ritual-list')
        response = self.client.post(
            url, 
            data=json.dumps(self.ritual_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ritual.objects.count(), 2)
        self.assertEqual(Ritual.objects.latest('id').title, 'Test Ritual')

    def test_get_rituals(self):
        """Test retrieving a list of rituals"""
        url = reverse('ritual-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_ritual_detail(self):
        """Test retrieving a specific ritual"""
        url = reverse('ritual-detail', args=[self.ritual.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Existing Ritual')

    def test_update_ritual(self):
        """Test updating a ritual"""
        url = reverse('ritual-detail', args=[self.ritual.id])
        updated_data = {
            'title': 'Updated Ritual',
            'description': 'This is an updated ritual',
            'status': 'scheduled'
        }
        response = self.client.patch(
            url, 
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ritual.refresh_from_db()
        self.assertEqual(self.ritual.title, 'Updated Ritual')

    def test_cancel_ritual(self):
        """Test cancelling a ritual"""
        url = reverse('ritual-detail', args=[self.ritual.id])
        cancel_data = {
            'status': 'cancelled'
        }
        response = self.client.patch(
            url, 
            data=json.dumps(cancel_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ritual.refresh_from_db()
        self.assertEqual(self.ritual.status, 'cancelled')

    def test_delete_ritual(self):
        """Test deleting a ritual"""
        url = reverse('ritual-detail', args=[self.ritual.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Ritual.objects.count(), 0)


class AttendanceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear un ritual
        future_date = datetime.now() + timedelta(days=7)
        self.ritual = Ritual.objects.create(
            title='Test Ritual',
            date=future_date,
            degree='Maestro',
            location='Templo Principal',
            description='This is a test ritual',
            status='scheduled',
            organizer=self.user
        )

    def test_confirm_attendance(self):
        """Test confirming attendance to a ritual"""
        url = reverse('ritual-attendance', args=[self.ritual.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Attendance.objects.count(), 1)
        self.assertEqual(Attendance.objects.first().member, self.user)
        self.assertEqual(Attendance.objects.first().ritual, self.ritual)

    def test_get_attendance_list(self):
        """Test retrieving attendance list for a ritual"""
        # Crear una asistencia
        Attendance.objects.create(
            ritual=self.ritual,
            member=self.user
        )
        
        url = reverse('ritual-attendance', args=[self.ritual.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['member_id'], self.user.id)

    def test_cancel_attendance(self):
        """Test cancelling attendance to a ritual"""
        # Crear una asistencia
        Attendance.objects.create(
            ritual=self.ritual,
            member=self.user
        )
        
        url = reverse('ritual-attendance', args=[self.ritual.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Attendance.objects.count(), 0)

    def test_cannot_attend_cancelled_ritual(self):
        """Test that attendance cannot be confirmed for cancelled rituals"""
        # Cancelar el ritual
        self.ritual.status = 'cancelled'
        self.ritual.save()
        
        url = reverse('ritual-attendance', args=[self.ritual.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Attendance.objects.count(), 0)

    def test_cannot_attend_past_ritual(self):
        """Test that attendance cannot be confirmed for past rituals"""
        # Cambiar la fecha del ritual al pasado
        past_date = datetime.now() - timedelta(days=1)
        self.ritual.date = past_date
        self.ritual.save()
        
        url = reverse('ritual-attendance', args=[self.ritual.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Attendance.objects.count(), 0)
