from django.contrib import admin
from .models import LodgeConfiguration, SystemLog, BackupConfiguration, Backup, SystemHealth

@admin.register(LodgeConfiguration)
class LodgeConfigurationAdmin(admin.ModelAdmin):
    list_display = ('lodge_name', 'lodge_number', 'grand_lodge_name', 'updated_by', 'updated_at')
    readonly_fields = ('updated_by', 'updated_at')
    fieldsets = (
        ('Información de la Logia', {
            'fields': ('lodge_name', 'lodge_number', 'foundation_date', 'grand_lodge_name', 'jurisdiction')
        }),
        ('Configuración Visual', {
            'fields': ('logo', 'primary_color', 'secondary_color')
        }),
        ('Configuración de Correo', {
            'fields': ('email_from', 'email_signature')
        }),
        ('Configuración del Sistema', {
            'fields': ('calendar_start_month', 'maintenance_mode', 'debug_mode')
        }),
        ('Información de Auditoría', {
            'fields': ('updated_by', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ('log_type', 'module', 'message', 'user', 'created_at')
    list_filter = ('log_type', 'module', 'created_at')
    search_fields = ('message', 'details', 'user__username', 'user__symbolic_name')
    readonly_fields = ('log_type', 'module', 'message', 'details', 'user', 'ip_address', 'user_agent', 'created_at')
    fieldsets = (
        ('Información del Registro', {
            'fields': ('log_type', 'module', 'message', 'details')
        }),
        ('Información del Usuario', {
            'fields': ('user', 'ip_address', 'user_agent')
        }),
        ('Fecha', {
            'fields': ('created_at',)
        }),
    )

@admin.register(BackupConfiguration)
class BackupConfigurationAdmin(admin.ModelAdmin):
    list_display = ('frequency', 'is_active', 'updated_by', 'updated_at')
    readonly_fields = ('updated_by', 'updated_at')
    fieldsets = (
        ('Configuración General', {
            'fields': ('is_active', 'frequency', 'weekday', 'day_of_month', 'hour', 'minute')
        }),
        ('Políticas de Retención', {
            'fields': ('keep_daily', 'keep_weekly', 'keep_monthly')
        }),
        ('Opciones de Almacenamiento', {
            'fields': ('backup_path', 'include_media', 'compress', 'encrypt')
        }),
        ('Notificaciones', {
            'fields': ('notify_on_success', 'notify_on_failure', 'notification_email')
        }),
        ('Información de Auditoría', {
            'fields': ('updated_by', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(Backup)
class BackupAdmin(admin.ModelAdmin):
    list_display = ('filename', 'backup_type', 'status', 'file_size', 'created_by', 'created_at')
    list_filter = ('backup_type', 'status', 'created_at')
    search_fields = ('filename', 'file_path', 'error_message')
    readonly_fields = ('filename', 'file_path', 'file_size', 'backup_type', 'status', 'error_message', 'created_by', 'created_at', 'completed_at')
    fieldsets = (
        ('Información del Respaldo', {
            'fields': ('filename', 'file_path', 'file_size', 'backup_type', 'status')
        }),
        ('Resultado', {
            'fields': ('error_message',)
        }),
        ('Información de Auditoría', {
            'fields': ('created_by', 'created_at', 'completed_at')
        }),
    )

@admin.register(SystemHealth)
class SystemHealthAdmin(admin.ModelAdmin):
    list_display = ('status', 'cpu_usage', 'memory_usage', 'disk_usage', 'created_at')
    list_filter = ('status', 'created_at')
    readonly_fields = ('cpu_usage', 'memory_usage', 'disk_usage', 'db_size', 'db_connections', 'active_users', 'response_time', 'status', 'status_message', 'created_at')
    fieldsets = (
        ('Métricas del Sistema', {
            'fields': ('cpu_usage', 'memory_usage', 'disk_usage')
        }),
        ('Métricas de la Base de Datos', {
            'fields': ('db_size', 'db_connections')
        }),
        ('Métricas de la Aplicación', {
            'fields': ('active_users', 'response_time')
        }),
        ('Estado General', {
            'fields': ('status', 'status_message')
        }),
        ('Fecha', {
            'fields': ('created_at',)
        }),
    )
