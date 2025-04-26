from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import LodgeConfiguration, SystemLog, BackupConfiguration, Backup, SystemHealth

User = get_user_model()

class LodgeConfigurationSerializer(serializers.ModelSerializer):
    updated_by_name = serializers.ReadOnlyField(source='updated_by.symbolic_name')
    
    class Meta:
        model = LodgeConfiguration
        fields = [
            'id', 'lodge_name', 'lodge_number', 'foundation_date',
            'grand_lodge_name', 'jurisdiction', 'logo', 'primary_color',
            'secondary_color', 'email_from', 'email_signature',
            'calendar_start_month', 'maintenance_mode', 'debug_mode',
            'updated_by', 'updated_by_name', 'updated_at'
        ]
        read_only_fields = ['updated_by', 'updated_at']

class SystemLogSerializer(serializers.ModelSerializer):
    log_type_display = serializers.ReadOnlyField(source='get_log_type_display')
    user_name = serializers.ReadOnlyField(source='user.symbolic_name')
    
    class Meta:
        model = SystemLog
        fields = [
            'id', 'log_type', 'log_type_display', 'module', 'message',
            'details', 'user', 'user_name', 'ip_address', 'user_agent',
            'created_at'
        ]
        read_only_fields = ['created_at']

class BackupConfigurationSerializer(serializers.ModelSerializer):
    frequency_display = serializers.ReadOnlyField(source='get_frequency_display')
    weekday_display = serializers.SerializerMethodField()
    updated_by_name = serializers.ReadOnlyField(source='updated_by.symbolic_name')
    
    class Meta:
        model = BackupConfiguration
        fields = [
            'id', 'is_active', 'frequency', 'frequency_display', 'weekday',
            'weekday_display', 'day_of_month', 'hour', 'minute',
            'keep_daily', 'keep_weekly', 'keep_monthly', 'backup_path',
            'include_media', 'compress', 'encrypt', 'notify_on_success',
            'notify_on_failure', 'notification_email', 'updated_by',
            'updated_by_name', 'updated_at'
        ]
        read_only_fields = ['updated_by', 'updated_at']
    
    def get_weekday_display(self, obj):
        weekday_choices = dict([(0, 'Lunes'), (1, 'Martes'), (2, 'Miércoles'),
                               (3, 'Jueves'), (4, 'Viernes'), (5, 'Sábado'), (6, 'Domingo')])
        return weekday_choices.get(obj.weekday, '')

class BackupSerializer(serializers.ModelSerializer):
    backup_type_display = serializers.ReadOnlyField(source='get_backup_type_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    file_size_human = serializers.SerializerMethodField()
    
    class Meta:
        model = Backup
        fields = [
            'id', 'filename', 'file_path', 'file_size', 'file_size_human',
            'backup_type', 'backup_type_display', 'status', 'status_display',
            'error_message', 'created_by', 'created_by_name', 'created_at',
            'completed_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'completed_at']
    
    def get_file_size_human(self, obj):
        """Convierte el tamaño en bytes a formato legible por humanos."""
        size_bytes = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0 or unit == 'TB':
                break
            size_bytes /= 1024.0
        return f"{size_bytes:.2f} {unit}"

class SystemHealthSerializer(serializers.ModelSerializer):
    status_display = serializers.ReadOnlyField(source='get_status_display')
    
    class Meta:
        model = SystemHealth
        fields = [
            'id', 'cpu_usage', 'memory_usage', 'disk_usage', 'db_size',
            'db_connections', 'active_users', 'response_time', 'status',
            'status_display', 'status_message', 'created_at'
        ]
        read_only_fields = ['created_at']
