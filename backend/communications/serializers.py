from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Event, Notification, NotificationRecipient, Message, MessageRecipient, Calendar, CalendarEvent

User = get_user_model()

class EventSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    event_type_display = serializers.ReadOnlyField(source='get_event_type_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    attendance_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'date', 'start_time', 'end_time',
            'location', 'is_virtual', 'virtual_link', 'event_type', 'event_type_display',
            'required_degree', 'status', 'status_display', 'created_by',
            'created_by_name', 'created_at', 'updated_at', 'attendance_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'attendance_count']
    
    def get_attendance_count(self, obj):
        return obj.attendances.filter(is_present=True).count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class NotificationRecipientSerializer(serializers.ModelSerializer):
    recipient_name = serializers.ReadOnlyField(source='recipient.symbolic_name')
    
    class Meta:
        model = NotificationRecipient
        fields = ['id', 'recipient', 'recipient_name', 'read', 'read_date']

class NotificationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    notification_type_display = serializers.ReadOnlyField(source='get_notification_type_display')
    event_title = serializers.ReadOnlyField(source='event.title')
    recipients_count = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'content', 'notification_type', 'notification_type_display',
            'event', 'event_title', 'send_date', 'expiry_date', 'created_by',
            'created_by_name', 'created_at', 'updated_at', 'recipients_count', 'read_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'recipients_count', 'read_count']
    
    def get_recipients_count(self, obj):
        return obj.recipients.count()
    
    def get_read_count(self, obj):
        return obj.recipient_statuses.filter(read=True).count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class NotificationDetailSerializer(NotificationSerializer):
    recipients = NotificationRecipientSerializer(source='recipient_statuses', many=True, read_only=True)
    
    class Meta(NotificationSerializer.Meta):
        fields = NotificationSerializer.Meta.fields + ['recipients']

class MessageRecipientSerializer(serializers.ModelSerializer):
    recipient_name = serializers.ReadOnlyField(source='recipient.symbolic_name')
    
    class Meta:
        model = MessageRecipient
        fields = ['id', 'recipient', 'recipient_name', 'read', 'read_date', 'archived', 'starred']

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.symbolic_name')
    recipients_count = serializers.SerializerMethodField()
    read_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Message
        fields = [
            'id', 'subject', 'content', 'sender', 'sender_name', 'send_date',
            'is_draft', 'created_at', 'updated_at', 'recipients_count', 'read_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'recipients_count', 'read_count']
    
    def get_recipients_count(self, obj):
        return obj.recipients.count()
    
    def get_read_count(self, obj):
        return obj.recipient_statuses.filter(read=True).count()

class MessageDetailSerializer(MessageSerializer):
    recipients = MessageRecipientSerializer(source='recipient_statuses', many=True, read_only=True)
    
    class Meta(MessageSerializer.Meta):
        fields = MessageSerializer.Meta.fields + ['recipients']

class MessageCreateSerializer(serializers.ModelSerializer):
    recipients = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True
    )
    
    class Meta:
        model = Message
        fields = ['subject', 'content', 'recipients', 'is_draft']
    
    def create(self, validated_data):
        recipients = validated_data.pop('recipients')
        validated_data['sender'] = self.context['request'].user
        
        message = Message.objects.create(**validated_data)
        
        # Crear las relaciones con los destinatarios
        for recipient in recipients:
            MessageRecipient.objects.create(message=message, recipient=recipient)
        
        return message

class CalendarEventSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')
    event_date = serializers.ReadOnlyField(source='event.date')
    event_type = serializers.ReadOnlyField(source='event.event_type')
    
    class Meta:
        model = CalendarEvent
        fields = [
            'id', 'event', 'event_title', 'event_date', 'event_type',
            'notes', 'is_highlighted'
        ]

class CalendarSerializer(serializers.ModelSerializer):
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    calendar_type_display = serializers.ReadOnlyField(source='get_calendar_type_display')
    events_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Calendar
        fields = [
            'id', 'title', 'description', 'calendar_type', 'calendar_type_display',
            'year', 'start_date', 'end_date', 'created_by', 'created_by_name',
            'created_at', 'updated_at', 'events_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'events_count']
    
    def get_events_count(self, obj):
        return obj.events.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class CalendarDetailSerializer(CalendarSerializer):
    events = CalendarEventSerializer(many=True, read_only=True)
    
    class Meta(CalendarSerializer.Meta):
        fields = CalendarSerializer.Meta.fields + ['events']
