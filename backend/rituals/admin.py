from django.contrib import admin
from .models import RitualPlan, RitualRole, RitualWork, RitualMinutes, RitualAttachment

class RitualRoleInline(admin.TabularInline):
    model = RitualRole
    extra = 1

class RitualWorkInline(admin.TabularInline):
    model = RitualWork
    extra = 1

class RitualAttachmentInline(admin.TabularInline):
    model = RitualAttachment
    extra = 1

@admin.register(RitualPlan)
class RitualPlanAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'ritual_type', 'degree', 'status', 'created_by')
    list_filter = ('ritual_type', 'degree', 'status', 'date')
    search_fields = ('title', 'description')
    date_hierarchy = 'date'
    readonly_fields = ('created_by', 'approved_by', 'created_at', 'updated_at')
    inlines = [RitualRoleInline, RitualWorkInline, RitualAttachmentInline]

@admin.register(RitualRole)
class RitualRoleAdmin(admin.ModelAdmin):
    list_display = ('get_role_type_display', 'ritual_plan', 'assigned_to', 'is_confirmed')
    list_filter = ('role_type', 'is_confirmed')
    search_fields = ('custom_role', 'notes', 'assigned_to__username', 'assigned_to__symbolic_name')

@admin.register(RitualWork)
class RitualWorkAdmin(admin.ModelAdmin):
    list_display = ('title', 'ritual_plan', 'work_type', 'responsible', 'estimated_duration', 'status')
    list_filter = ('work_type', 'status')
    search_fields = ('title', 'description', 'responsible__username', 'responsible__symbolic_name')

@admin.register(RitualMinutes)
class RitualMinutesAdmin(admin.ModelAdmin):
    list_display = ('ritual_plan', 'status', 'attendance_count', 'visitors_count', 'created_by')
    list_filter = ('status',)
    search_fields = ('content',)
    readonly_fields = ('created_by', 'approved_by', 'created_at', 'updated_at')

@admin.register(RitualAttachment)
class RitualAttachmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'ritual_plan', 'attachment_type', 'uploaded_by')
    list_filter = ('attachment_type',)
    search_fields = ('title', 'description')
    readonly_fields = ('uploaded_by', 'created_at', 'updated_at')
