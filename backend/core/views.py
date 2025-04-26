from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import get_user_model
import os
import psutil
import subprocess
import datetime

from .models import LodgeConfiguration, SystemLog, BackupConfiguration, Backup, SystemHealth
from .serializers import (
    LodgeConfigurationSerializer, SystemLogSerializer, BackupConfigurationSerializer,
    BackupSerializer, SystemHealthSerializer
)
from authentication.mixins import WorshipfulMasterRequiredMixin, MasterMasonRequiredMixin

User = get_user_model()

class LodgeConfigurationViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar la configuración de la Logia.
    """
    queryset = LodgeConfiguration.objects.all()
    serializer_class = LodgeConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated, WorshipfulMasterRequiredMixin]
    
    def get_object(self):
        """
        Obtener la configuración actual o crear una por defecto si no existe.
        """
        try:
            return LodgeConfiguration.objects.first()
        except LodgeConfiguration.DoesNotExist:
            # Crear una configuración por defecto
            return LodgeConfiguration.objects.create(
                lodge_name="Logia Luz y Verdad",
                lodge_number="1",
                grand_lodge_name="Gran Logia",
                primary_color="#1a237e",
                secondary_color="#ffc107"
            )
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        Obtener la configuración actual de la Logia.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar registros del sistema.
    """
    queryset = SystemLog.objects.all()
    serializer_class = SystemLogSerializer
    permission_classes = [permissions.IsAuthenticated, MasterMasonRequiredMixin]
    
    def get_queryset(self):
        """
        Filtrar registros según parámetros de búsqueda.
        """
        queryset = SystemLog.objects.all()
        
        # Filtrar por tipo de registro
        log_type = self.request.query_params.get('log_type')
        if log_type:
            queryset = queryset.filter(log_type=log_type)
        
        # Filtrar por módulo
        module = self.request.query_params.get('module')
        if module:
            queryset = queryset.filter(module=module)
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(message__icontains=search) |
                Q(details__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def add_log(self, request):
        """
        Añadir un nuevo registro al sistema.
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """
        Obtener la dirección IP del cliente.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class BackupConfigurationViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar la configuración de respaldos.
    """
    queryset = BackupConfiguration.objects.all()
    serializer_class = BackupConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated, WorshipfulMasterRequiredMixin]
    
    def get_object(self):
        """
        Obtener la configuración actual o crear una por defecto si no existe.
        """
        try:
            return BackupConfiguration.objects.first()
        except BackupConfiguration.DoesNotExist:
            # Crear una configuración por defecto
            return BackupConfiguration.objects.create(
                is_active=True,
                frequency=BackupConfiguration.WEEKLY,
                weekday=0,  # Lunes
                hour=2,     # 2 AM
                minute=0,
                backup_path='/backups'
            )
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        Obtener la configuración actual de respaldos.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BackupViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar respaldos.
    """
    queryset = Backup.objects.all()
    serializer_class = BackupSerializer
    permission_classes = [permissions.IsAuthenticated, WorshipfulMasterRequiredMixin]
    
    def get_queryset(self):
        """
        Filtrar respaldos según parámetros de búsqueda.
        """
        queryset = Backup.objects.all()
        
        # Filtrar por tipo de respaldo
        backup_type = self.request.query_params.get('backup_type')
        if backup_type:
            queryset = queryset.filter(backup_type=backup_type)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def create_backup(self, request):
        """
        Crear un nuevo respaldo manual.
        """
        # Crear un registro de respaldo
        backup = Backup.objects.create(
            filename=f"manual_backup_{timezone.now().strftime('%Y%m%d_%H%M%S')}.zip",
            file_path="/backups/",
            backup_type=Backup.MANUAL,
            status=Backup.IN_PROGRESS,
            created_by=request.user
        )
        
        try:
            # Aquí iría la lógica real para crear el respaldo
            # Por ahora, simulamos el proceso
            
            # Actualizar el registro con información simulada
            backup.file_size = 1024 * 1024 * 10  # 10 MB
            backup.status = Backup.SUCCESS
            backup.completed_at = timezone.now()
            backup.save()
            
            serializer = self.get_serializer(backup)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            # En caso de error, actualizar el registro
            backup.status = Backup.FAILURE
            backup.error_message = str(e)
            backup.completed_at = timezone.now()
            backup.save()
            
            return Response(
                {'detail': f'Error al crear respaldo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """
        Restaurar un respaldo.
        """
        backup = self.get_object()
        
        # Verificar que el respaldo sea válido
        if backup.status != Backup.SUCCESS:
            return Response(
                {'detail': 'Solo se pueden restaurar respaldos exitosos.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Aquí iría la lógica real para restaurar el respaldo
            # Por ahora, simulamos el proceso
            
            # Registrar la acción en los logs del sistema
            SystemLog.objects.create(
                log_type=SystemLog.INFO,
                module='core.backup',
                message=f"Restauración de respaldo iniciada: {backup.filename}",
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({'status': 'restore initiated'})
        except Exception as e:
            # Registrar el error en los logs del sistema
            SystemLog.objects.create(
                log_type=SystemLog.ERROR,
                module='core.backup',
                message=f"Error al restaurar respaldo: {backup.filename}",
                details=str(e),
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response(
                {'detail': f'Error al restaurar respaldo: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_client_ip(self, request):
        """
        Obtener la dirección IP del cliente.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SystemHealthViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar el estado de salud del sistema.
    """
    queryset = SystemHealth.objects.all()
    serializer_class = SystemHealthSerializer
    permission_classes = [permissions.IsAuthenticated, MasterMasonRequiredMixin]
    
    def get_queryset(self):
        """
        Filtrar registros de salud según parámetros de búsqueda.
        """
        queryset = SystemHealth.objects.all()
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(created_at__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(created_at__lte=date_to)
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """
        Obtener el estado actual del sistema.
        """
        # Obtener métricas del sistema
        cpu_usage = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent
        
        # Determinar el estado general
        status = SystemHealth.HEALTHY
        status_message = "El sistema está funcionando correctamente."
        
        if cpu_usage > 90 or memory_usage > 90 or disk_usage > 90:
            status = SystemHealth.CRITICAL
            status_message = "El sistema está en estado crítico. Se requiere atención inmediata."
        elif cpu_usage > 70 or memory_usage > 70 or disk_usage > 70:
            status = SystemHealth.WARNING
            status_message = "El sistema está experimentando alta carga. Se recomienda monitoreo."
        
        # Crear un registro de salud
        health = SystemHealth.objects.create(
            cpu_usage=cpu_usage,
            memory_usage=memory_usage,
            disk_usage=disk_usage,
            db_size=0,  # Esto requeriría una consulta específica a la base de datos
            db_connections=0,  # Esto requeriría una consulta específica a la base de datos
            active_users=User.objects.filter(is_active=True).count(),
            response_time=0.0,  # Esto requeriría mediciones específicas
            status=status,
            status_message=status_message
        )
        
        serializer = self.get_serializer(health)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Obtener un resumen del estado del sistema.
        """
        # Obtener métricas del sistema
        cpu_usage = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent
        
        # Obtener estadísticas de la aplicación
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        
        # Obtener información del sistema
        uptime_seconds = int(psutil.boot_time())
        uptime_datetime = datetime.datetime.fromtimestamp(uptime_seconds)
        uptime = timezone.now() - timezone.make_aware(uptime_datetime)
        
        # Determinar el estado general
        status = "healthy"
        if cpu_usage > 90 or memory_usage > 90 or disk_usage > 90:
            status = "critical"
        elif cpu_usage > 70 or memory_usage > 70 or disk_usage > 70:
            status = "warning"
        
        return Response({
            'status': status,
            'cpu_usage': cpu_usage,
            'memory_usage': memory_usage,
            'disk_usage': disk_usage,
            'total_users': total_users,
            'active_users': active_users,
            'uptime_days': uptime.days,
            'uptime_hours': uptime.seconds // 3600,
            'uptime_minutes': (uptime.seconds % 3600) // 60,
            'timestamp': timezone.now()
        })
