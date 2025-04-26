from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MemberProfile, MemberDocument, MemberProgress, Attendance

User = get_user_model()

class MemberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberProfile
        fields = [
            'id', 'birth_date', 'profession', 'civil_id', 'mother_lodge', 
            'masonic_id', 'emergency_contact_name', 'emergency_contact_phone', 
            'emergency_contact_relation', 'last_attendance_date', 'attendance_count'
        ]

class MemberDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberDocument
        fields = [
            'id', 'title', 'document_type', 'file', 'description', 
            'issue_date', 'expiry_date', 'uploaded_by', 'created_at'
        ]
        read_only_fields = ['uploaded_by', 'created_at']
    
    def create(self, validated_data):
        # Asignar el usuario que realiza la solicitud como el que sube el documento
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)

class MemberProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberProgress
        fields = [
            'id', 'title', 'description', 'date', 'ceremony_type', 
            'location', 'recorded_by', 'created_at'
        ]
        read_only_fields = ['recorded_by', 'created_at']
    
    def create(self, validated_data):
        # Asignar el usuario que realiza la solicitud como el que registra el progreso
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)

class AttendanceSerializer(serializers.ModelSerializer):
    event_title = serializers.ReadOnlyField(source='event.title')
    event_date = serializers.ReadOnlyField(source='event.date')
    user_name = serializers.ReadOnlyField(source='user.symbolic_name')
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'user', 'event', 'event_title', 'event_date', 
            'user_name', 'is_present', 'excuse', 'recorded_by'
        ]
        read_only_fields = ['recorded_by']
    
    def create(self, validated_data):
        # Asignar el usuario que realiza la solicitud como el que registra la asistencia
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)

class MemberDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información detallada de un miembro,
    incluyendo su perfil, documentos y progreso.
    """
    profile = MemberProfileSerializer(read_only=True)
    documents = MemberDocumentSerializer(many=True, read_only=True)
    progress = MemberProgressSerializer(many=True, read_only=True)
    degree_name = serializers.SerializerMethodField()
    officer_role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'symbolic_name', 'degree', 'degree_name', 'initiation_date', 
            'passing_date', 'raising_date', 'phone_number', 'address', 
            'is_active', 'officer_role', 'profile', 'documents', 'progress'
        ]
    
    def get_degree_name(self, obj):
        degree_choices = {
            1: 'Aprendiz',
            2: 'Compañero',
            3: 'Maestro'
        }
        return degree_choices.get(obj.degree, 'Desconocido')
    
    def get_officer_role(self, obj):
        if hasattr(obj, 'officer_role') and obj.officer_role:
            return {
                'role': obj.officer_role.role,
                'name': obj.officer_role.get_role_display(),
                'start_date': obj.officer_role.start_date,
                'end_date': obj.officer_role.end_date,
                'is_active': obj.officer_role.is_active
            }
        return None
