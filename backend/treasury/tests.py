import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from authentication.models import MasonicUser
from treasury.models import Payment, Invoice, FinancialReport

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
def treasurer_user(create_user):
    return create_user("tesorero", "password123", degree=3, office="Tesorero")

@pytest.fixture
def regular_user(create_user):
    return create_user("regular", "password123", degree=1)

@pytest.mark.django_db
class TestTreasuryModule:
    
    def test_treasury_dashboard_access(self, api_client, treasurer_user, regular_user):
        """Verificar que solo usuarios autorizados pueden acceder al dashboard de tesorería"""
        url = reverse('treasury:dashboard')
        
        # Usuario sin autenticación no puede acceder
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
        # Usuario regular no puede acceder
        api_client.force_authenticate(user=regular_user)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN
        
        # Tesorero puede acceder
        api_client.force_authenticate(user=treasurer_user)
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
    def test_payment_list(self, api_client, treasurer_user):
        """Verificar que se pueden listar los pagos"""
        url = reverse('treasury:payment-list')
        api_client.force_authenticate(user=treasurer_user)
        
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert 'count' in response.data
        
    def test_payment_create(self, api_client, treasurer_user):
        """Verificar que se pueden crear pagos"""
        url = reverse('treasury:payment-list')
        api_client.force_authenticate(user=treasurer_user)
        
        data = {
            'member': 1,  # Asumiendo que existe un miembro con ID 1
            'amount': 100.00,
            'concept': 'Cuota mensual',
            'due_date': '2025-05-01',
            'status': 'pending'
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Payment.objects.filter(concept='Cuota mensual').exists()
        
    def test_payment_update(self, api_client, treasurer_user):
        """Verificar que se pueden actualizar pagos"""
        # Crear un pago primero
        payment = Payment.objects.create(
            member_id=1,
            amount=100.00,
            concept='Cuota mensual',
            due_date='2025-05-01',
            status='pending'
        )
        
        url = reverse('treasury:payment-detail', kwargs={'pk': payment.id})
        api_client.force_authenticate(user=treasurer_user)
        
        data = {
            'status': 'completed',
            'payment_date': '2025-04-25'
        }
        
        response = api_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Verificar que el pago se actualizó
        payment.refresh_from_db()
        assert payment.status == 'completed'
        assert str(payment.payment_date) == '2025-04-25'
        
    def test_invoice_list(self, api_client, treasurer_user):
        """Verificar que se pueden listar las facturas"""
        url = reverse('treasury:invoice-list')
        api_client.force_authenticate(user=treasurer_user)
        
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert 'results' in response.data
        assert 'count' in response.data
        
    def test_invoice_create(self, api_client, treasurer_user):
        """Verificar que se pueden crear facturas"""
        url = reverse('treasury:invoice-list')
        api_client.force_authenticate(user=treasurer_user)
        
        data = {
            'recipient_type': 'member',
            'recipient': 1,  # Asumiendo que existe un miembro con ID 1
            'issue_date': '2025-04-25',
            'due_date': '2025-05-25',
            'status': 'issued',
            'items': [
                {
                    'description': 'Cuota mensual Mayo',
                    'quantity': 1,
                    'unit_price': 100.00
                }
            ]
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert Invoice.objects.filter(status='issued').exists()
        
    def test_invoice_update_status(self, api_client, treasurer_user):
        """Verificar que se puede actualizar el estado de una factura"""
        # Crear una factura primero
        invoice = Invoice.objects.create(
            recipient_type='member',
            recipient_id=1,
            issue_date='2025-04-25',
            due_date='2025-05-25',
            status='issued',
            subtotal=100.00,
            total_amount=100.00
        )
        
        url = reverse('treasury:invoice-status', kwargs={'pk': invoice.id})
        api_client.force_authenticate(user=treasurer_user)
        
        data = {
            'status': 'paid'
        }
        
        response = api_client.patch(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Verificar que la factura se actualizó
        invoice.refresh_from_db()
        assert invoice.status == 'paid'
        
    def test_financial_report_generation(self, api_client, treasurer_user):
        """Verificar que se pueden generar informes financieros"""
        url = reverse('treasury:financial-report')
        api_client.force_authenticate(user=treasurer_user)
        
        data = {
            'report_type': 'monthly',
            'start_date': '2025-04-01',
            'end_date': '2025-04-30'
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert 'income' in response.data
        assert 'expenses' in response.data
        assert 'balance' in response.data
        
    def test_export_financial_report(self, api_client, treasurer_user):
        """Verificar que se pueden exportar informes financieros"""
        url = reverse('treasury:export-report')
        api_client.force_authenticate(user=treasurer_user)
        
        data = {
            'report_type': 'monthly',
            'start_date': '2025-04-01',
            'end_date': '2025-04-30',
            'format': 'pdf'
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.get('Content-Type') == 'application/pdf'
