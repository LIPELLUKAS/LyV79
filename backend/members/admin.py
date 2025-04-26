from django.contrib import admin
from .models import MemberProfile, MemberDocument, MemberProgress, Attendance

@admin.register(MemberProfile)
class MemberProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'profession', 'birth_date', 'last_attendance_date', 'attendance_count')
    search_fields = ('user__username', 'user__symbolic_name', 'user__first_name', 'user__last_name', 'profession')
    list_filter = ('user__is_active',)
    date_hierarchy = 'last_attendance_date'
    readonly_fields = ('created_at', 'updated_at')

@admin.register(MemberDocument)
class MemberDocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'document_type', 'issue_date', 'uploaded_by')
    search_fields = ('title', 'user__username', 'user__symbolic_name')
    list_filter = ('document_type', 'issue_date')
    date_hierarchy = 'issue_date'
    readonly_fields = ('created_at', 'updated_at', 'uploaded_by')

@admin.register(MemberProgress)
class MemberProgressAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'date', 'ceremony_type', 'recorded_by')
    search_fields = ('title', 'user__username', 'user__symbolic_name', 'description')
    list_filter = ('date', 'ceremony_type')
    date_hierarchy = 'date'
    readonly_fields = ('created_at', 'updated_at', 'recorded_by')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('user', 'event', 'is_present', 'recorded_by')
    search_fields = ('user__username', 'user__symbolic_name', 'event__title')
    list_filter = ('is_present', 'event__date')
    readonly_fields = ('created_at', 'updated_at', 'recorded_by')
