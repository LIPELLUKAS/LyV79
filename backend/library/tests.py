from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Book, Document, Category
import json
from datetime import datetime, timedelta

class CategoryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear categorías
        self.book_category = Category.objects.create(
            name='Filosofía',
            type='books'
        )
        
        self.document_category = Category.objects.create(
            name='Administrativo',
            type='documents'
        )

    def test_get_book_categories(self):
        """Test retrieving book categories"""
        url = reverse('category-list') + '?type=books'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Filosofía')

    def test_get_document_categories(self):
        """Test retrieving document categories"""
        url = reverse('category-list') + '?type=documents'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Administrativo')

    def test_create_category(self):
        """Test creating a new category"""
        url = reverse('category-list')
        category_data = {
            'name': 'Historia',
            'type': 'books'
        }
        response = self.client.post(
            url, 
            data=json.dumps(category_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Category.objects.count(), 3)
        self.assertEqual(Category.objects.filter(type='books').count(), 2)


class BookTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear categoría
        self.category = Category.objects.create(
            name='Filosofía',
            type='books'
        )
        
        # Datos para crear un libro
        self.book_data = {
            'title': 'Test Book',
            'author': 'Test Author',
            'publication_year': 2020,
            'publisher': 'Test Publisher',
            'isbn': '1234567890123',
            'description': 'This is a test book',
            'categories': ['Filosofía']
        }
        
        # Crear un libro existente
        self.book = Book.objects.create(
            title='Existing Book',
            author='Existing Author',
            publication_year=2019,
            publisher='Existing Publisher',
            isbn='9876543210987',
            description='This is an existing book',
            available=True
        )
        self.book.categories.add(self.category)

    def test_create_book(self):
        """Test creating a new book"""
        url = reverse('book-list')
        response = self.client.post(
            url, 
            data=json.dumps(self.book_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Book.objects.count(), 2)
        self.assertEqual(Book.objects.latest('id').title, 'Test Book')

    def test_get_books(self):
        """Test retrieving a list of books"""
        url = reverse('book-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_book_detail(self):
        """Test retrieving a specific book"""
        url = reverse('book-detail', args=[self.book.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Existing Book')

    def test_update_book(self):
        """Test updating a book"""
        url = reverse('book-detail', args=[self.book.id])
        updated_data = {
            'title': 'Updated Book',
            'author': 'Updated Author'
        }
        response = self.client.patch(
            url, 
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertEqual(self.book.title, 'Updated Book')
        self.assertEqual(self.book.author, 'Updated Author')

    def test_borrow_book(self):
        """Test borrowing a book"""
        url = reverse('book-borrow', args=[self.book.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertFalse(self.book.available)
        self.assertEqual(self.book.borrowed_by, self.user)
        self.assertIsNotNone(self.book.due_date)

    def test_return_book(self):
        """Test returning a book"""
        # Primero prestar el libro
        self.book.available = False
        self.book.borrowed_by = self.user
        self.book.due_date = datetime.now() + timedelta(days=14)
        self.book.save()
        
        url = reverse('book-return', args=[self.book.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.book.refresh_from_db()
        self.assertTrue(self.book.available)
        self.assertIsNone(self.book.borrowed_by)
        self.assertIsNone(self.book.due_date)

    def test_delete_book(self):
        """Test deleting a book"""
        url = reverse('book-detail', args=[self.book.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Book.objects.count(), 0)


class DocumentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        # Crear categoría
        self.category = Category.objects.create(
            name='Administrativo',
            type='documents'
        )
        
        # Datos para crear un documento
        self.document_data = {
            'title': 'Test Document',
            'description': 'This is a test document',
            'categories': ['Administrativo']
        }
        
        # Crear un documento existente
        self.document = Document.objects.create(
            title='Existing Document',
            description='This is an existing document',
            uploaded_by=self.user,
            file_url='http://example.com/documents/existing.pdf'
        )
        self.document.categories.add(self.category)

    def test_get_documents(self):
        """Test retrieving a list of documents"""
        url = reverse('document-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_document_detail(self):
        """Test retrieving a specific document"""
        url = reverse('document-detail', args=[self.document.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Existing Document')

    def test_update_document(self):
        """Test updating a document"""
        url = reverse('document-detail', args=[self.document.id])
        updated_data = {
            'title': 'Updated Document',
            'description': 'This is an updated document'
        }
        response = self.client.patch(
            url, 
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.document.refresh_from_db()
        self.assertEqual(self.document.title, 'Updated Document')
        self.assertEqual(self.document.description, 'This is an updated document')

    def test_delete_document(self):
        """Test deleting a document"""
        url = reverse('document-detail', args=[self.document.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Document.objects.count(), 0)
