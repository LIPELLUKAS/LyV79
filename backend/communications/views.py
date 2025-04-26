from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import (
    Event, Notification, NotificationRecipient, 
    Message, MessageRecipient, Calendar, CalendarEvent
)
from .serializers import (
    EventSerializer, NotificationSerializer, NotificationDetailSerializer,
    MessageSerializer, MessageDetailSerializer, MessageCreateSerializer,
    CalendarSerializer, CalendarDetailSerializer, CalendarEventSerializer
)
from authentication.mixins import SecretaryRequiredMixin

User = get_user_model()

class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar eventos y tenidas.
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar eventos según parámetros de búsqueda.
        """
        queryset = Event.objects.all().order_by('-date', '-start_time')
        
        # Filtrar por tipo de evento
        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filtrar por estado
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filtrar por grado requerido
        required_degree = self.request.query_params.get('required_degree')
        if required_degree:
            queryset = queryset.filter(required_degree=required_degree)
        
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
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )
        
        # Filtrar por eventos futuros
        upcoming = self.request.query_params.get('upcoming')
        if upcoming and upcoming.lower() == 'true':
            today = timezone.now().date()
            queryset = queryset.filter(date__gte=today)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_as_completed(self, request, pk=None):
        """
        Marcar un evento como completado.
        """
        event = self.get_object()
        
        if event.status == Event.COMPLETED:
            return Response(
                {'detail': 'El evento ya está marcado como completado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event.status = Event.COMPLETED
        event.save()
        
        serializer = self.get_serializer(event)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancelar un evento.
        """
        event = self.get_object()
        
        if event.status == Event.CANCELLED:
            return Response(
                {'detail': 'El evento ya está cancelado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        event.status = Event.CANCELLED
        event.save()
        
        serializer = self.get_serializer(event)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        """
        Obtener la lista de asistentes a un evento.
        """
        event = self.get_object()
        attendances = event.attendances.all()
        
        data = []
        for attendance in attendances:
            user = attendance.user
            data.append({
                'id': user.id,
                'username': user.username,
                'symbolic_name': user.symbolic_name,
                'full_name': f"{user.first_name} {user.last_name}".strip(),
                'degree': user.degree,
                'is_present': attendance.is_present,
                'excuse': attendance.excuse if not attendance.is_present else None
            })
        
        return Response(data)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar notificaciones.
    """
    queryset = Notification.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return NotificationDetailSerializer
        return NotificationSerializer
    
    def get_queryset(self):
        """
        Filtrar notificaciones según parámetros de búsqueda.
        """
        queryset = Notification.objects.all().order_by('-send_date')
        
        # Filtrar por tipo de notificación
        notification_type = self.request.query_params.get('notification_type')
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        # Filtrar por evento relacionado
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(send_date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(send_date__lte=date_to)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
        
        # Filtrar por notificaciones recibidas por el usuario actual
        received = self.request.query_params.get('received')
        if received and received.lower() == 'true':
            queryset = queryset.filter(recipients=self.request.user)
        
        # Filtrar por notificaciones no leídas por el usuario actual
        unread = self.request.query_params.get('unread')
        if unread and unread.lower() == 'true':
            queryset = queryset.filter(
                recipients=self.request.user,
                recipient_statuses__read=False
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Crear una notificación y asignarla a los destinatarios.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Obtener los destinatarios
        recipients_data = request.data.get('recipients', [])
        
        # Crear la notificación
        notification = serializer.save(created_by=request.user)
        
        # Asignar los destinatarios
        for recipient_id in recipients_data:
            try:
                recipient = User.objects.get(pk=recipient_id)
                NotificationRecipient.objects.create(
                    notification=notification,
                    recipient=recipient
                )
            except User.DoesNotExist:
                pass
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Marcar una notificación como leída por el usuario actual.
        """
        notification = self.get_object()
        
        try:
            recipient_status = NotificationRecipient.objects.get(
                notification=notification,
                recipient=request.user
            )
            
            if not recipient_status.read:
                recipient_status.read = True
                recipient_status.read_date = timezone.now()
                recipient_status.save()
            
            return Response({'status': 'notification marked as read'})
        except NotificationRecipient.DoesNotExist:
            return Response(
                {'detail': 'El usuario no es destinatario de esta notificación.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar mensajes internos.
    """
    queryset = Message.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        elif self.action == 'retrieve':
            return MessageDetailSerializer
        return MessageSerializer
    
    def get_queryset(self):
        """
        Filtrar mensajes según parámetros de búsqueda.
        """
        user = self.request.user
        
        # Por defecto, mostrar mensajes enviados o recibidos por el usuario actual
        queryset = Message.objects.filter(
            Q(sender=user) | Q(recipients=user)
        ).distinct().order_by('-send_date')
        
        # Filtrar por tipo de bandeja
        inbox_type = self.request.query_params.get('inbox_type')
        if inbox_type == 'sent':
            queryset = Message.objects.filter(sender=user).order_by('-send_date')
        elif inbox_type == 'received':
            queryset = Message.objects.filter(recipients=user).order_by('-send_date')
        elif inbox_type == 'drafts':
            queryset = Message.objects.filter(sender=user, is_draft=True).order_by('-updated_at')
        elif inbox_type == 'archived':
            queryset = Message.objects.filter(
                recipients=user,
                recipient_statuses__archived=True
            ).order_by('-send_date')
        elif inbox_type == 'starred':
            queryset = Message.objects.filter(
                recipients=user,
                recipient_statuses__starred=True
            ).order_by('-send_date')
        
        # Filtrar por mensajes no leídos
        unread = self.request.query_params.get('unread')
        if unread and unread.lower() == 'true':
            queryset = queryset.filter(
                recipients=user,
                recipient_statuses__read=False
            )
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(subject__icontains=search) |
                Q(content__icontains=search)
            )
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """
        Obtener un mensaje y marcarlo como leído si el usuario actual es destinatario.
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        
        # Si el usuario actual es destinatario, marcar como leído
        if request.user in instance.recipients.all():
            try:
                recipient_status = MessageRecipient.objects.get(
                    message=instance,
                    recipient=request.user
                )
                
                if not recipient_status.read:
                    recipient_status.read = True
                    recipient_status.read_date = timezone.now()
                    recipient_status.save()
            except MessageRecipient.DoesNotExist:
                pass
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def star(self, request, pk=None):
        """
        Marcar un mensaje como destacado.
        """
        message = self.get_object()
        
        try:
            recipient_status = MessageRecipient.objects.get(
                message=message,
                recipient=request.user
            )
            
            recipient_status.starred = True
            recipient_status.save()
            
            return Response({'status': 'message starred'})
        except MessageRecipient.DoesNotExist:
            return Response(
                {'detail': 'El usuario no es destinatario de este mensaje.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def unstar(self, request, pk=None):
        """
        Quitar la marca de destacado de un mensaje.
        """
        message = self.get_object()
        
        try:
            recipient_status = MessageRecipient.objects.get(
                message=message,
                recipient=request.user
            )
            
            recipient_status.starred = False
            recipient_status.save()
            
            return Response({'status': 'message unstarred'})
        except MessageRecipient.DoesNotExist:
            return Response(
                {'detail': 'El usuario no es destinatario de este mensaje.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """
        Archivar un mensaje.
        """
        message = self.get_object()
        
        try:
            recipient_status = MessageRecipient.objects.get(
                message=message,
                recipient=request.user
            )
            
            recipient_status.archived = True
            recipient_status.save()
            
            return Response({'status': 'message archived'})
        except MessageRecipient.DoesNotExist:
            return Response(
                {'detail': 'El usuario no es destinatario de este mensaje.'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def unarchive(self, request, pk=None):
        """
        Desarchivar un mensaje.
        """
        message = self.get_object()
        
        try:
            recipient_status = MessageRecipient.objects.get(
                message=message,
                recipient=request.user
            )
            
            recipient_status.archived = False
            recipient_status.save()
            
            return Response({'status': 'message unarchived'})
        except MessageRecipient.DoesNotExist:
            return Response(
                {'detail': 'El usuario no es destinatario de este mensaje.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class CalendarViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar calendarios masónicos.
    """
    queryset = Calendar.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CalendarDetailSerializer
        return CalendarSerializer
    
    def get_queryset(self):
        """
        Filtrar calendarios según parámetros de búsqueda.
        """
        queryset = Calendar.objects.all().order_by('-year', '-start_date')
        
        # Filtrar por tipo de calendario
        calendar_type = self.request.query_params.get('calendar_type')
        if calendar_type:
            queryset = queryset.filter(calendar_type=calendar_type)
        
        # Filtrar por año
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(year=year)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_event(self, request, pk=None):
        """
        Añadir un evento al calendario.
        """
        calendar = self.get_object()
        
        serializer = CalendarEventSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(calendar=calendar)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        """
        Obtener todos los eventos de un calendario.
        """
        calendar = self.get_object()
        calendar_events = calendar.events.all()
        serializer = CalendarEventSerializer(calendar_events, many=True)
        return Response(serializer.data)
