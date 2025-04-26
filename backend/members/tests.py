from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Member, MemberProfile
import json

class MemberTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        # Datos para crear un miembro
        self.member_data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'phone': '+1234567890',
            'degree': 'Maestro',
            'initiation_date': '2020-01-01',
            'status': 'active',
            'address': '123 Main St, City',
            'birth_date': '1980-01-01'
        }
        
        # Crear un miembro existente
        self.member = Member.objects.create(
            user=self.user,
            first_name='Existing',
            last_name='Member',
            email='existing.member@example.com',
            phone='+0987654321',
            degree='Aprendiz',
            initiation_date='2019-01-01',
            status='active'
        )
        
        # Crear perfil para el miembro existente
        self.profile = MemberProfile.objects.create(
            member=self.member,
            address='456 Second St, City',
            birth_date='1975-05-15',
            occupation='Engineer',
            emergency_contact='Jane Doe',
            emergency_phone='+1122334455'
        )

    def test_get_members(self):
        """Test retrieving a list of members"""
        url = reverse('member-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_member_detail(self):
        """Test retrieving a specific member"""
        url = reverse('member-detail', args=[self.member.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Existing')
        self.assertEqual(response.data['last_name'], 'Member')
        self.assertEqual(response.data['profile']['address'], '456 Second St, City')

    def test_create_member(self):
        """Test creating a new member"""
        url = reverse('member-list')
        response = self.client.post(
            url, 
            data=json.dumps(self.member_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Member.objects.count(), 2)
        self.assertEqual(Member.objects.latest('id').first_name, 'John')
        self.assertEqual(Member.objects.latest('id').last_name, 'Doe')
        
        # Verificar que se creó el perfil
        self.assertEqual(MemberProfile.objects.count(), 2)
        self.assertEqual(MemberProfile.objects.latest('id').address, '123 Main St, City')

    def test_update_member(self):
        """Test updating a member"""
        url = reverse('member-detail', args=[self.member.id])
        updated_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'degree': 'Compañero',
            'profile': {
                'address': 'Updated Address',
                'occupation': 'Updated Occupation'
            }
        }
        response = self.client.patch(
            url, 
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member.refresh_from_db()
        self.assertEqual(self.member.first_name, 'Updated')
        self.assertEqual(self.member.last_name, 'Name')
        self.assertEqual(self.member.degree, 'Compañero')
        
        # Verificar que se actualizó el perfil
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.address, 'Updated Address')
        self.assertEqual(self.profile.occupation, 'Updated Occupation')

    def test_change_member_status(self):
        """Test changing a member's status"""
        url = reverse('member-detail', args=[self.member.id])
        status_data = {
            'status': 'inactive'
        }
        response = self.client.patch(
            url, 
            data=json.dumps(status_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.member.refresh_from_db()
        self.assertEqual(self.member.status, 'inactive')

    def test_delete_member(self):
        """Test deleting a member"""
        url = reverse('member-detail', args=[self.member.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Member.objects.count(), 0)
        # Verificar que se eliminó el perfil
        self.assertEqual(MemberProfile.objects.count(), 0)

    def test_filter_members_by_degree(self):
        """Test filtering members by degree"""
        url = reverse('member-list') + '?degree=Aprendiz'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['degree'], 'Aprendiz')
        
        # No debe haber miembros con grado Maestro
        url = reverse('member-list') + '?degree=Maestro'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_filter_members_by_status(self):
        """Test filtering members by status"""
        url = reverse('member-list') + '?status=active'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['status'], 'active')
        
        # No debe haber miembros inactivos
        url = reverse('member-list') + '?status=inactive'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_search_members(self):
        """Test searching members by name or email"""
        url = reverse('member-list') + '?search=Existing'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['first_name'], 'Existing')
        
        url = reverse('member-list') + '?search=existing.member@example.com'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['email'], 'existing.member@example.com')
        
        # No debe haber resultados para esta búsqueda
        url = reverse('member-list') + '?search=nonexistent'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)
