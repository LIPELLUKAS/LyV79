from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from .models import Announcement, Message
import json

class AnnouncementTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        self.announcement_data = {
            'title': 'Test Announcement',
            'content': 'This is a test announcement content',
            'tags': ['important', 'test'],
        }
        
        self.announcement = Announcement.objects.create(
            title='Existing Announcement',
            content='This is an existing announcement',
            author=self.user
        )
        self.announcement.tags = ['existing', 'announcement']
        self.announcement.save()

    def test_create_announcement(self):
        """Test creating a new announcement"""
        url = reverse('announcement-list')
        response = self.client.post(
            url, 
            data=json.dumps(self.announcement_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Announcement.objects.count(), 2)
        self.assertEqual(Announcement.objects.latest('id').title, 'Test Announcement')

    def test_get_announcements(self):
        """Test retrieving a list of announcements"""
        url = reverse('announcement-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_announcement_detail(self):
        """Test retrieving a specific announcement"""
        url = reverse('announcement-detail', args=[self.announcement.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Existing Announcement')

    def test_update_announcement(self):
        """Test updating an announcement"""
        url = reverse('announcement-detail', args=[self.announcement.id])
        updated_data = {
            'title': 'Updated Announcement',
            'content': 'This is an updated announcement',
            'tags': ['updated', 'test']
        }
        response = self.client.put(
            url, 
            data=json.dumps(updated_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.announcement.refresh_from_db()
        self.assertEqual(self.announcement.title, 'Updated Announcement')

    def test_delete_announcement(self):
        """Test deleting an announcement"""
        url = reverse('announcement-detail', args=[self.announcement.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Announcement.objects.count(), 0)


class MessageTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword'
        )
        self.recipient = User.objects.create_user(
            username='recipient',
            email='recipient@example.com',
            password='recipientpassword'
        )
        self.client.force_authenticate(user=self.user)
        
        self.message_data = {
            'subject': 'Test Message',
            'content': 'This is a test message content',
            'recipients': [self.recipient.username],
        }
        
        self.message = Message.objects.create(
            subject='Existing Message',
            content='This is an existing message',
            sender=self.user
        )
        self.message.recipients.add(self.recipient)
        self.message.save()

    def test_create_message(self):
        """Test creating a new message"""
        url = reverse('message-list')
        response = self.client.post(
            url, 
            data=json.dumps(self.message_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Message.objects.count(), 2)
        self.assertEqual(Message.objects.latest('id').subject, 'Test Message')

    def test_get_messages(self):
        """Test retrieving a list of messages"""
        url = reverse('message-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_get_message_detail(self):
        """Test retrieving a specific message"""
        url = reverse('message-detail', args=[self.message.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['subject'], 'Existing Message')

    def test_mark_message_as_read(self):
        """Test marking a message as read"""
        self.assertFalse(self.message.read)
        url = reverse('message-detail', args=[self.message.id])
        response = self.client.patch(
            url, 
            data=json.dumps({'read': True}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.message.refresh_from_db()
        self.assertTrue(self.message.read)

    def test_delete_message(self):
        """Test deleting a message"""
        url = reverse('message-detail', args=[self.message.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Message.objects.count(), 0)
