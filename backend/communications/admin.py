from django.contrib import admin
from .models import Event, Notification, NotificationRecipient, Message, MessageRecipient, Calendar, CalendarEvent

class NotificationRecipientInline(admin.TabularInline):
    model = NotificationRecipient
    extra = 1

class MessageRecipientInline(admin.TabularInline):
    model = MessageRecipient
    extra = 1

class CalendarEventInline(admin.TabularInline):
    model = CalendarEvent
    extra = 1

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'start_time', 'event_type', 'required_degree', 'status')
    list_filter = ('event_type', 'status', 'required_degree', 'date')
    search_fields = ('title', 'description', 'location')
    date_hierarchy = 'date'
    readonly_fields = ('created_by', 'created_at', 'updated_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'notification_type', 'send_date', 'created_by')
    list_filter = ('notification_type', 'send_date')
    search_fields = ('title', 'content')
    date_hierarchy = 'send_date'
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    inlines = [NotificationRecipientInline]

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('subject', 'sender', 'send_date', 'is_draft')
    list_filter = ('is_draft', 'send_date')
    search_fields = ('subject', 'content', 'sender__username', 'sender__symbolic_name')
    date_hierarchy = 'send_date'
    readonly_fields = ('created_at', 'updated_at')
    inlines = [MessageRecipientInline]

@admin.register(Calendar)
class CalendarAdmin(admin.ModelAdmin):
    list_display = ('title', 'calendar_type', 'year', 'start_date', 'end_date')
    list_filter = ('calendar_type', 'year')
    search_fields = ('title', 'description')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_by', 'created_at', 'updated_at')
    inlines = [CalendarEventInline]
