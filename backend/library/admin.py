from django.contrib import admin
from .models import DocumentCategory, Document, DocumentAccess, DocumentComment, DocumentRating

class DocumentCommentInline(admin.TabularInline):
    model = DocumentComment
    extra = 1
    readonly_fields = ['user', 'created_at', 'updated_at']

class DocumentRatingInline(admin.TabularInline):
    model = DocumentRating
    extra = 1
    readonly_fields = ['user', 'created_at', 'updated_at']

class DocumentAccessInline(admin.TabularInline):
    model = DocumentAccess
    extra = 0
    readonly_fields = ['user', 'access_type', 'access_date', 'ip_address', 'user_agent']
    can_delete = False
    max_num = 0

@admin.register(DocumentCategory)
class DocumentCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'required_degree', 'order', 'created_by')
    list_filter = ('required_degree', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_by', 'created_at', 'updated_at')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'document_type', 'required_degree', 'is_public', 'is_featured', 'view_count', 'download_count', 'uploaded_by')
    list_filter = ('document_type', 'required_degree', 'is_public', 'is_featured', 'created_at')
    search_fields = ('title', 'description', 'author', 'tags')
    readonly_fields = ('uploaded_by', 'created_at', 'updated_at', 'view_count', 'download_count')
    inlines = [DocumentCommentInline, DocumentRatingInline, DocumentAccessInline]

@admin.register(DocumentComment)
class DocumentCommentAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('content', 'document__title', 'user__username', 'user__symbolic_name')
    readonly_fields = ('user', 'created_at', 'updated_at')

@admin.register(DocumentRating)
class DocumentRatingAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('document__title', 'user__username', 'user__symbolic_name')
    readonly_fields = ('user', 'created_at', 'updated_at')

@admin.register(DocumentAccess)
class DocumentAccessAdmin(admin.ModelAdmin):
    list_display = ('document', 'user', 'access_type', 'access_date', 'ip_address')
    list_filter = ('access_type', 'access_date')
    search_fields = ('document__title', 'user__username', 'user__symbolic_name', 'ip_address')
    readonly_fields = ('document', 'user', 'access_type', 'access_date', 'ip_address', 'user_agent')
