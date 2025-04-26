from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import RitualPlan, RitualRole, RitualWork, RitualMinutes, RitualAttachment
from .serializers import (
    RitualPlanSerializer, RitualPlanDetailSerializer, RitualPlanCreateSerializer,
    RitualRoleSerializer, RitualWorkSerializer, RitualMinutesSerializer, RitualAttachmentSerializer
)
from authentication.mixins import WorshipfulMasterRequiredMixin, MasterMasonRequiredMixin

User = get_user_model()

class RitualPlanViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar planes rituales.
    """
    queryset = RitualPlan.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RitualPlanCreateSerializer
        elif self.action == 'retrieve':
            return RitualPlanDetailSerializer
        return RitualPlanSerializer
    
    def get_queryset(self):
        """
        Filtrar planes rituales según parámetros de búsqueda.
        """
        queryset = RitualPlan.objects.all().order_by('-date', '-created_at')
        
        # Filtrar por tipo de ritual
        ritual_type = self.request.query_params.get('ritual_type')
        if ritual_type:
            queryset = queryset.filter(ritual_type=ritual_type)
        
        # Filtrar por grado
        degree = self.request.query_params.get('degree')
        if degree:
            queryset = queryset.filter(degree=degree)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Filtrar por planes futuros
        upcoming = self.request.query_params.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(date__gte=today)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Aprobar un plan ritual.
        """
        plan = self.get_object()
        
        if plan.status != RitualPlan.DRAFT:
            return Response(
                {'detail': 'Solo se pueden aprobar planes en estado borrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plan.status = RitualPlan.APPROVED
        plan.approved_by = request.user
        plan.save()
        
        serializer = self.get_serializer(plan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_completed(self, request, pk=None):
        """
        Marcar un plan ritual como completado.
        """
        plan = self.get_object()
        
        if plan.status == RitualPlan.COMPLETED:
            return Response(
                {'detail': 'El plan ya está marcado como completado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plan.status = RitualPlan.COMPLETED
        plan.save()
        
        serializer = self.get_serializer(plan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancelar un plan ritual.
        """
        plan = self.get_object()
        
        if plan.status == RitualPlan.CANCELLED:
            return Response(
                {'detail': 'El plan ya está cancelado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        plan.status = RitualPlan.CANCELLED
        plan.save()
        
        serializer = self.get_serializer(plan)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def roles(self, request, pk=None):
        """
        Obtener los roles de un plan ritual.
        """
        plan = self.get_object()
        roles = plan.roles.all()
        serializer = RitualRoleSerializer(roles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_role(self, request, pk=None):
        """
        Añadir un rol a un plan ritual.
        """
        plan = self.get_object()
        
        serializer = RitualRoleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ritual_plan=plan)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def works(self, request, pk=None):
        """
        Obtener los trabajos de un plan ritual.
        """
        plan = self.get_object()
        works = plan.works.all()
        serializer = RitualWorkSerializer(works, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_work(self, request, pk=None):
        """
        Añadir un trabajo a un plan ritual.
        """
        plan = self.get_object()
        
        serializer = RitualWorkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ritual_plan=plan)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attachments(self, request, pk=None):
        """
        Obtener los adjuntos de un plan ritual.
        """
        plan = self.get_object()
        attachments = plan.attachments.all()
        serializer = RitualAttachmentSerializer(attachments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_attachment(self, request, pk=None):
        """
        Añadir un adjunto a un plan ritual.
        """
        plan = self.get_object()
        
        serializer = RitualAttachmentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(ritual_plan=plan, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RitualRoleViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar roles rituales.
    """
    queryset = RitualRole.objects.all()
    serializer_class = RitualRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar roles según parámetros de búsqueda.
        """
        queryset = RitualRole.objects.all()
        
        # Filtrar por plan ritual
        ritual_plan_id = self.request.query_params.get('ritual_plan_id')
        if ritual_plan_id:
            queryset = queryset.filter(ritual_plan_id=ritual_plan_id)
        
        # Filtrar por tipo de rol
        role_type = self.request.query_params.get('role_type')
        if role_type:
            queryset = queryset.filter(role_type=role_type)
        
        # Filtrar por miembro asignado
        assigned_to_id = self.request.query_params.get('assigned_to_id')
        if assigned_to_id:
            queryset = queryset.filter(assigned_to_id=assigned_to_id)
        
        # Filtrar por estado de confirmación
        is_confirmed = self.request.query_params.get('is_confirmed')
        if is_confirmed is not None:
            is_confirmed = is_confirmed.lower() == 'true'
            queryset = queryset.filter(is_confirmed=is_confirmed)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """
        Asignar un miembro a un rol ritual.
        """
        role = self.get_object()
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'detail': 'Se requiere el ID del usuario.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(pk=user_id)
            role.assigned_to = user
            role.save()
            
            serializer = self.get_serializer(role)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirmar un rol ritual.
        """
        role = self.get_object()
        
        role.is_confirmed = True
        role.save()
        
        serializer = self.get_serializer(role)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def unconfirm(self, request, pk=None):
        """
        Desconfirmar un rol ritual.
        """
        role = self.get_object()
        
        role.is_confirmed = False
        role.save()
        
        serializer = self.get_serializer(role)
        return Response(serializer.data)


class RitualWorkViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar trabajos rituales.
    """
    queryset = RitualWork.objects.all()
    serializer_class = RitualWorkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar trabajos según parámetros de búsqueda.
        """
        queryset = RitualWork.objects.all()
        
        # Filtrar por plan ritual
        ritual_plan_id = self.request.query_params.get('ritual_plan_id')
        if ritual_plan_id:
            queryset = queryset.filter(ritual_plan_id=ritual_plan_id)
        
        # Filtrar por tipo de trabajo
        work_type = self.request.query_params.get('work_type')
        if work_type:
            queryset = queryset.filter(work_type=work_type)
        
        # Filtrar por responsable
        responsible_id = self.request.query_params.get('responsible_id')
        if responsible_id:
            queryset = queryset.filter(responsible_id=responsible_id)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Actualizar el estado de un trabajo ritual.
        """
        work = self.get_object()
        
        status_param = request.data.get('status')
        if not status_param:
            return Response(
                {'detail': 'Se requiere el estado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if status_param not in [RitualWork.PENDING, RitualWork.CONFIRMED, RitualWork.COMPLETED, RitualWork.CANCELLED]:
            return Response(
                {'detail': 'Estado no válido.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        work.status = status_param
        work.save()
        
        serializer = self.get_serializer(work)
        return Response(serializer.data)


class RitualMinutesViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar actas rituales.
    """
    queryset = RitualMinutes.objects.all()
    serializer_class = RitualMinutesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar actas según parámetros de búsqueda.
        """
        queryset = RitualMinutes.objects.all()
        
        # Filtrar por plan ritual
        ritual_plan_id = self.request.query_params.get('ritual_plan_id')
        if ritual_plan_id:
            queryset = queryset.filter(ritual_plan_id=ritual_plan_id)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def finalize(self, request, pk=None):
        """
        Finalizar un acta ritual.
        """
        minutes = self.get_object()
        
        if minutes.status != RitualMinutes.DRAFT:
            return Response(
                {'detail': 'Solo se pueden finalizar actas en estado borrador.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        minutes.status = RitualMinutes.FINALIZED
        minutes.save()
        
        serializer = self.get_serializer(minutes)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Aprobar un acta ritual.
        """
        minutes = self.get_object()
        
        if minutes.status != RitualMinutes.FINALIZED:
            return Response(
                {'detail': 'Solo se pueden aprobar actas finalizadas.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        minutes.status = RitualMinutes.APPROVED
        minutes.approved_by = request.user
        minutes.save()
        
        serializer = self.get_serializer(minutes)
        return Response(serializer.data)


class RitualAttachmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar adjuntos rituales.
    """
    queryset = RitualAttachment.objects.all()
    serializer_class = RitualAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar adjuntos según parámetros de búsqueda.
        """
        queryset = RitualAttachment.objects.all()
        
        # Filtrar por plan ritual
        ritual_plan_id = self.request.query_params.get('ritual_plan_id')
        if ritual_plan_id:
            queryset = queryset.filter(ritual_plan_id=ritual_plan_id)
        
        # Filtrar por tipo de adjunto
        attachment_type = self.request.query_params.get('attachment_type')
        if attachment_type:
            queryset = queryset.filter(attachment_type=attachment_type)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
