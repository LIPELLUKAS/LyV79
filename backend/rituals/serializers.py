from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import RitualPlan, RitualRole, RitualWork, RitualMinutes, RitualAttachment

User = get_user_model()

class RitualRoleSerializer(serializers.ModelSerializer):
    role_type_display = serializers.ReadOnlyField(source='get_role_type_display')
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.symbolic_name')
    
    class Meta:
        model = RitualRole
        fields = [
            'id', 'role_type', 'role_type_display', 'custom_role', 
            'assigned_to', 'assigned_to_name', 'notes', 'is_confirmed'
        ]

class RitualWorkSerializer(serializers.ModelSerializer):
    work_type_display = serializers.ReadOnlyField(source='get_work_type_display')
    responsible_name = serializers.ReadOnlyField(source='responsible.symbolic_name')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    
    class Meta:
        model = RitualWork
        fields = [
            'id', 'title', 'description', 'work_type', 'work_type_display',
            'responsible', 'responsible_name', 'estimated_duration', 'order',
            'attachment', 'status', 'status_display'
        ]

class RitualAttachmentSerializer(serializers.ModelSerializer):
    attachment_type_display = serializers.ReadOnlyField(source='get_attachment_type_display')
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.symbolic_name')
    
    class Meta:
        model = RitualAttachment
        fields = [
            'id', 'title', 'description', 'attachment_type', 'attachment_type_display',
            'file', 'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

class RitualMinutesSerializer(serializers.ModelSerializer):
    status_display = serializers.ReadOnlyField(source='get_status_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    approved_by_name = serializers.ReadOnlyField(source='approved_by.symbolic_name')
    
    class Meta:
        model = RitualMinutes
        fields = [
            'id', 'content', 'attendance_count', 'visitors_count',
            'status', 'status_display', 'created_by', 'created_by_name',
            'approved_by', 'approved_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'approved_by', 'created_at', 'updated_at']

class RitualPlanSerializer(serializers.ModelSerializer):
    ritual_type_display = serializers.ReadOnlyField(source='get_ritual_type_display')
    status_display = serializers.ReadOnlyField(source='get_status_display')
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    approved_by_name = serializers.ReadOnlyField(source='approved_by.symbolic_name')
    event_title = serializers.ReadOnlyField(source='event.title')
    
    class Meta:
        model = RitualPlan
        fields = [
            'id', 'title', 'description', 'date', 'start_time', 'end_time',
            'ritual_type', 'ritual_type_display', 'degree', 'status', 'status_display',
            'event', 'event_title', 'created_by', 'created_by_name',
            'approved_by', 'approved_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'approved_by', 'created_at', 'updated_at']

class RitualPlanDetailSerializer(RitualPlanSerializer):
    roles = RitualRoleSerializer(many=True, read_only=True)
    works = RitualWorkSerializer(many=True, read_only=True)
    attachments = RitualAttachmentSerializer(many=True, read_only=True)
    minutes = RitualMinutesSerializer(read_only=True)
    
    class Meta(RitualPlanSerializer.Meta):
        fields = RitualPlanSerializer.Meta.fields + ['roles', 'works', 'attachments', 'minutes']

class RitualPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RitualPlan
        fields = [
            'title', 'description', 'date', 'start_time', 'end_time',
            'ritual_type', 'degree', 'event'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
