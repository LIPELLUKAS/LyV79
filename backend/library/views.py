from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Avg
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import DocumentCategory, Document, DocumentAccess, DocumentComment, DocumentRating
from .serializers import (
    DocumentCategorySerializer, DocumentCategoryDetailSerializer,
    DocumentSerializer, DocumentDetailSerializer, DocumentCommentSerializer,
    DocumentRatingSerializer, DocumentAccessSerializer
)
from authentication.mixins import MasterMasonRequiredMixin

User = get_user_model()

class DocumentCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar categorías de documentos.
    """
    queryset = DocumentCategory.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DocumentCategoryDetailSerializer
        return DocumentCategorySerializer
    
    def get_queryset(self):
        """
        Filtrar categorías según parámetros de búsqueda y grado del usuario.
        """
        user = self.request.user
        queryset = DocumentCategory.objects.filter(required_degree__lte=user.degree)
        
        # Filtrar por categoría padre
        parent_id = self.request.query_params.get('parent_id')
        if parent_id:
            if parent_id == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
        
        # Filtrar por grado requerido
        required_degree = self.request.query_params.get('required_degree')
        if required_degree:
            queryset = queryset.filter(required_degree=required_degree)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        
        return queryset.order_by('order', 'name')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """
        Obtener los documentos de una categoría.
        """
        category = self.get_object()
        documents = Document.objects.filter(
            category=category,
            required_degree__lte=request.user.degree
        )
        
        serializer = DocumentSerializer(documents, many=True)
        return Response(serializer.data)


class DocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar documentos.
    """
    queryset = Document.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DocumentDetailSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        """
        Filtrar documentos según parámetros de búsqueda y grado del usuario.
        """
        user = self.request.user
        queryset = Document.objects.filter(required_degree__lte=user.degree)
        
        # Filtrar por categoría
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filtrar por tipo de documento
        document_type = self.request.query_params.get('document_type')
        if document_type:
            queryset = queryset.filter(document_type=document_type)
        
        # Filtrar por grado requerido
        required_degree = self.request.query_params.get('required_degree')
        if required_degree:
            queryset = queryset.filter(required_degree=required_degree)
        
        # Filtrar por visibilidad
        is_public = self.request.query_params.get('is_public')
        if is_public is not None:
            is_public = is_public.lower() == 'true'
            queryset = queryset.filter(is_public=is_public)
        
        # Filtrar por destacados
        is_featured = self.request.query_params.get('is_featured')
        if is_featured is not None:
            is_featured = is_featured.lower() == 'true'
            queryset = queryset.filter(is_featured=is_featured)
        
        # Filtrar por búsqueda de texto
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(author__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Ordenar por diferentes campos
        order_by = self.request.query_params.get('order_by', '-created_at')
        if order_by == 'rating':
            queryset = queryset.annotate(avg_rating=Avg('ratings__rating')).order_by('-avg_rating')
        elif order_by == 'views':
            queryset = queryset.order_by('-view_count')
        elif order_by == 'downloads':
            queryset = queryset.order_by('-download_count')
        else:
            queryset = queryset.order_by(order_by)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """
        Obtener un documento y registrar la visualización.
        """
        instance = self.get_object()
        
        # Registrar el acceso de visualización
        DocumentAccess.objects.create(
            document=instance,
            user=request.user,
            access_type=DocumentAccess.VIEW,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Incrementar el contador de visualizaciones
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def download(self, request, pk=None):
        """
        Registrar la descarga de un documento.
        """
        document = self.get_object()
        
        # Registrar el acceso de descarga
        DocumentAccess.objects.create(
            document=document,
            user=request.user,
            access_type=DocumentAccess.DOWNLOAD,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Incrementar el contador de descargas
        document.download_count += 1
        document.save(update_fields=['download_count'])
        
        return Response({
            'status': 'download registered',
            'download_url': request.build_absolute_uri(document.file.url)
        })
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """
        Añadir un comentario a un documento.
        """
        document = self.get_object()
        
        serializer = DocumentCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(document=document, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """
        Calificar un documento.
        """
        document = self.get_object()
        
        rating_value = request.data.get('rating')
        if not rating_value or not isinstance(rating_value, int) or not (1 <= rating_value <= 5):
            return Response(
                {'detail': 'Se requiere una calificación válida (1-5).'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar si el usuario ya ha calificado este documento
        rating, created = DocumentRating.objects.update_or_create(
            document=document,
            user=request.user,
            defaults={'rating': rating_value}
        )
        
        serializer = DocumentRatingSerializer(rating)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """
        Obtener los comentarios de un documento.
        """
        document = self.get_object()
        comments = document.comments.all().order_by('-created_at')
        
        serializer = DocumentCommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        """
        Obtener las calificaciones de un documento.
        """
        document = self.get_object()
        ratings = document.ratings.all().order_by('-created_at')
        
        serializer = DocumentRatingSerializer(ratings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        """
        Marcar o desmarcar un documento como destacado.
        """
        document = self.get_object()
        
        document.is_featured = not document.is_featured
        document.save(update_fields=['is_featured'])
        
        serializer = self.get_serializer(document)
        return Response(serializer.data)
    
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


class DocumentCommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar comentarios de documentos.
    """
    queryset = DocumentComment.objects.all()
    serializer_class = DocumentCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar comentarios según parámetros de búsqueda.
        """
        queryset = DocumentComment.objects.all()
        
        # Filtrar por documento
        document_id = self.request.query_params.get('document_id')
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DocumentRatingViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar calificaciones de documentos.
    """
    queryset = DocumentRating.objects.all()
    serializer_class = DocumentRatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Filtrar calificaciones según parámetros de búsqueda.
        """
        queryset = DocumentRating.objects.all()
        
        # Filtrar por documento
        document_id = self.request.query_params.get('document_id')
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DocumentAccessViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint para consultar accesos a documentos.
    """
    queryset = DocumentAccess.objects.all()
    serializer_class = DocumentAccessSerializer
    permission_classes = [permissions.IsAuthenticated, MasterMasonRequiredMixin]
    
    def get_queryset(self):
        """
        Filtrar accesos según parámetros de búsqueda.
        """
        queryset = DocumentAccess.objects.all()
        
        # Filtrar por documento
        document_id = self.request.query_params.get('document_id')
        if document_id:
            queryset = queryset.filter(document_id=document_id)
        
        # Filtrar por usuario
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filtrar por tipo de acceso
        access_type = self.request.query_params.get('access_type')
        if access_type:
            queryset = queryset.filter(access_type=access_type)
        
        # Filtrar por rango de fechas
        date_from = self.request.query_params.get('date_from')
        if date_from:
            queryset = queryset.filter(access_date__gte=date_from)
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            queryset = queryset.filter(access_date__lte=date_to)
        
        return queryset.order_by('-access_date')
