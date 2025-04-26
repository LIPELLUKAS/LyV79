from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DocumentCategory, Document, DocumentAccess, DocumentComment, DocumentRating

User = get_user_model()

class DocumentCategorySerializer(serializers.ModelSerializer):
    subcategories_count = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()
    created_by_name = serializers.ReadOnlyField(source='created_by.symbolic_name')
    
    class Meta:
        model = DocumentCategory
        fields = [
            'id', 'name', 'description', 'parent', 'required_degree',
            'order', 'created_by', 'created_by_name', 'created_at',
            'updated_at', 'subcategories_count', 'documents_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'subcategories_count', 'documents_count']
    
    def get_subcategories_count(self, obj):
        return obj.subcategories.count()
    
    def get_documents_count(self, obj):
        return obj.documents.count()

class DocumentCategoryDetailSerializer(DocumentCategorySerializer):
    subcategories = serializers.SerializerMethodField()
    
    class Meta(DocumentCategorySerializer.Meta):
        fields = DocumentCategorySerializer.Meta.fields + ['subcategories']
    
    def get_subcategories(self, obj):
        subcategories = obj.subcategories.all()
        return DocumentCategorySerializer(subcategories, many=True).data

class DocumentCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.symbolic_name')
    
    class Meta:
        model = DocumentComment
        fields = [
            'id', 'content', 'user', 'user_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class DocumentRatingSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.symbolic_name')
    
    class Meta:
        model = DocumentRating
        fields = [
            'id', 'rating', 'user', 'user_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']

class DocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.ReadOnlyField(source='get_document_type_display')
    category_name = serializers.ReadOnlyField(source='category.name')
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.symbolic_name')
    average_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'document_type', 'document_type_display', 'file', 'author',
            'publication_date', 'language', 'pages', 'required_degree',
            'tags', 'is_public', 'is_featured', 'view_count', 'download_count',
            'uploaded_by', 'uploaded_by_name', 'created_at', 'updated_at',
            'average_rating', 'ratings_count', 'comments_count'
        ]
        read_only_fields = [
            'uploaded_by', 'created_at', 'updated_at', 'view_count',
            'download_count', 'average_rating', 'ratings_count', 'comments_count'
        ]
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings:
            return 0
        return sum(r.rating for r in ratings) / len(ratings)
    
    def get_ratings_count(self, obj):
        return obj.ratings.count()
    
    def get_comments_count(self, obj):
        return obj.comments.count()

class DocumentDetailSerializer(DocumentSerializer):
    comments = DocumentCommentSerializer(many=True, read_only=True)
    ratings = DocumentRatingSerializer(many=True, read_only=True)
    
    class Meta(DocumentSerializer.Meta):
        fields = DocumentSerializer.Meta.fields + ['comments', 'ratings']

class DocumentAccessSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.symbolic_name')
    document_title = serializers.ReadOnlyField(source='document.title')
    access_type_display = serializers.ReadOnlyField(source='get_access_type_display')
    
    class Meta:
        model = DocumentAccess
        fields = [
            'id', 'document', 'document_title', 'user', 'user_name',
            'access_type', 'access_type_display', 'access_date',
            'ip_address', 'user_agent'
        ]
        read_only_fields = ['user', 'access_date', 'ip_address', 'user_agent']
