from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import OfficerRole

User = get_user_model()

class OfficerRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficerRole
        fields = ['role', 'start_date', 'end_date', 'is_active']

class UserSerializer(serializers.ModelSerializer):
    officer_role = OfficerRoleSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'symbolic_name', 'degree', 'initiation_date', 'passing_date', 
            'raising_date', 'phone_number', 'address', 'is_active', 
            'two_factor_enabled', 'officer_role'
        ]
        read_only_fields = ['is_active', 'two_factor_enabled']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'first_name', 'last_name',
            'symbolic_name', 'degree', 'phone_number', 'address'
        ]
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No existe un usuario con este correo electrónico.")
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

class TwoFactorSetupSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)

class TwoFactorVerifySerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
