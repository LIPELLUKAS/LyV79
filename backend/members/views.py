from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import MemberProfile, MemberDocument, MemberProgress, Attendance
from .serializers import (
    MemberProfileSerializer, MemberDocumentSerializer, 
    MemberProgressSerializer, AttendanceSerializer, MemberDetailSerializer
)
from authentication.mixins import MasterMasonRequiredMixin

User = get_user_model()

class MemberViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar miembros.
    """
    queryset = User.objects.all()
    serializer_class = MemberDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar miembros según parámetros de búsqueda y permisos del usuario.
        """
        queryset = User.objects.all().order_by('symbolic_name', 'username')
        
        # Filtrar por estado activo/inactivo
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)
        
        # Filtrar por grado
        degree = self.request.query_params.get('degree')
        if degree:
            queryset = queryset.filter(degree=degree)
        
        # Filtrar por cargo oficial
        officer_role = self.request.query_params.get('officer_role')
        if officer_role:
            queryset = queryset.filter(officer_role__role=officer_role, officer_role__is_active=True)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(symbolic_name__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """
        Obtener el perfil detallado de un miembro.
        """
        user = self.get_object()
        profile, created = MemberProfile.objects.get_or_create(user=user)
        serializer = MemberProfileSerializer(profile)
        return Response(serializer.data)
    
    @action(detail=True, methods=['put', 'patch'])
    def update_profile(self, request, pk=None):
        """
        Actualizar el perfil de un miembro.
        """
        user = self.get_object()
        profile, created = MemberProfile.objects.get_or_create(user=user)
        
        serializer = MemberProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """
        Obtener los documentos de un miembro.
        """
        user = self.get_object()
        documents = MemberDocument.objects.filter(user=user)
        serializer = MemberDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_document(self, request, pk=None):
        """
        Añadir un documento a un miembro.
        """
        user = self.get_object()
        
        # Añadir el usuario al que pertenece el documento
        data = request.data.copy()
        data['user'] = user.id
        
        serializer = MemberDocumentSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """
        Obtener el registro de progreso de un miembro.
        """
        user = self.get_object()
        progress = MemberProgress.objects.filter(user=user)
        serializer = MemberProgressSerializer(progress, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_progress(self, request, pk=None):
        """
        Añadir un registro de progreso a un miembro.
        """
        user = self.get_object()
        
        # Añadir el usuario al que pertenece el progreso
        data = request.data.copy()
        data['user'] = user.id
        
        serializer = MemberProgressSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attendance(self, request, pk=None):
        """
        Obtener el registro de asistencia de un miembro.
        """
        user = self.get_object()
        attendance = Attendance.objects.filter(user=user)
        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)


class MemberDocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar documentos de miembros.
    """
    queryset = MemberDocument.objects.all()
    serializer_class = MemberDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar documentos según parámetros y permisos.
        """
        queryset = MemberDocument.objects.all()
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por tipo de documento
        doc_type = self.request.query_params.get('document_type')
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class MemberProgressViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar registros de progreso de miembros.
    """
    queryset = MemberProgress.objects.all()
    serializer_class = MemberProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar registros de progreso según parámetros y permisos.
        """
        queryset = MemberProgress.objects.all()
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por fecha
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)


class AttendanceViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar registros de asistencia.
    """
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar registros de asistencia según parámetros y permisos.
        """
        queryset = Attendance.objects.all()
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por evento
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filtrar por presencia
        is_present = self.request.query_params.get('is_present')
        if is_present is not None:
            is_present = is_present.lower() == 'true'
            queryset = queryset.filter(is_present=is_present)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(recorded_by=self.request.user)
