from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class DocumentCategory(models.Model):
    """
    Modelo para categorías de documentos en la biblioteca digital.
    """
    name = models.CharField(_('nombre'), max_length=100)
    description = models.TextField(_('descripción'), blank=True)
    
    # Jerarquía de categorías
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='subcategories',
        verbose_name=_('categoría padre')
    )
    
    # Grado mínimo requerido para acceder a la categoría
    required_degree = models.PositiveSmallIntegerField(
        _('grado requerido'),
        default=1,
        choices=[
            (1, _('Aprendiz')),
            (2, _('Compañero')),
            (3, _('Maestro')),
        ]
    )
    
    # Orden de visualización
    order = models.PositiveIntegerField(_('orden'), default=0)
    
    # Campos para auditoría
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_categories',
        verbose_name=_('creada por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('categoría de documentos')
        verbose_name_plural = _('categorías de documentos')
        ordering = ['order', 'name']
        unique_together = ['name', 'parent']
    
    def __str__(self):
        if self.parent:
            return f"{self.parent} > {self.name}"
        return self.name
    
    @property
    def full_path(self):
        """
        Devuelve la ruta completa de la categoría.
        """
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name


class Document(models.Model):
    """
    Modelo para documentos en la biblioteca digital.
    """
    title = models.CharField(_('título'), max_length=200)
    description = models.TextField(_('descripción'), blank=True)
    
    # Categoría del documento
    category = models.ForeignKey(
        DocumentCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name='documents',
        verbose_name=_('categoría')
    )
    
    # Tipo de documento
    BOOK = 'book'
    ARTICLE = 'article'
    LECTURE = 'lecture'
    RITUAL = 'ritual'
    CONSTITUTION = 'constitution'
    REGULATION = 'regulation'
    HISTORY = 'history'
    SYMBOLISM = 'symbolism'
    OTHER = 'other'
    
    DOCUMENT_TYPE_CHOICES = [
        (BOOK, _('Libro')),
        (ARTICLE, _('Artículo')),
        (LECTURE, _('Plancha')),
        (RITUAL, _('Ritual')),
        (CONSTITUTION, _('Constitución')),
        (REGULATION, _('Reglamento')),
        (HISTORY, _('Historia')),
        (SYMBOLISM, _('Simbolismo')),
        (OTHER, _('Otro')),
    ]
    
    document_type = models.CharField(
        _('tipo de documento'),
        max_length=20,
        choices=DOCUMENT_TYPE_CHOICES,
        default=OTHER
    )
    
    # Archivo del documento
    file = models.FileField(_('archivo'), upload_to='library_documents/')
    
    # Metadatos del documento
    author = models.CharField(_('autor'), max_length=200, blank=True)
    publication_date = models.DateField(_('fecha de publicación'), null=True, blank=True)
    language = models.CharField(_('idioma'), max_length=50, blank=True)
    pages = models.PositiveIntegerField(_('páginas'), null=True, blank=True)
    
    # Grado mínimo requerido para acceder al documento
    required_degree = models.PositiveSmallIntegerField(
        _('grado requerido'),
        default=1,
        choices=[
            (1, _('Aprendiz')),
            (2, _('Compañero')),
            (3, _('Maestro')),
        ]
    )
    
    # Etiquetas para facilitar la búsqueda
    tags = models.CharField(_('etiquetas'), max_length=500, blank=True, help_text=_('Separadas por comas'))
    
    # Control de acceso adicional
    is_public = models.BooleanField(_('es público'), default=False, help_text=_('Visible para todos los miembros con grado suficiente'))
    is_featured = models.BooleanField(_('destacado'), default=False)
    
    # Estadísticas
    view_count = models.PositiveIntegerField(_('número de vistas'), default=0)
    download_count = models.PositiveIntegerField(_('número de descargas'), default=0)
    
    # Campos para auditoría
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='library_documents',
        verbose_name=_('subido por')
    )
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('documento')
        verbose_name_plural = _('documentos')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title


class DocumentAccess(models.Model):
    """
    Modelo para registrar el acceso a los documentos.
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='accesses',
        verbose_name=_('documento')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='document_accesses',
        verbose_name=_('usuario')
    )
    
    # Tipo de acceso
    VIEW = 'view'
    DOWNLOAD = 'download'
    
    ACCESS_TYPE_CHOICES = [
        (VIEW, _('Visualización')),
        (DOWNLOAD, _('Descarga')),
    ]
    
    access_type = models.CharField(
        _('tipo de acceso'),
        max_length=10,
        choices=ACCESS_TYPE_CHOICES
    )
    
    # Fecha y hora del acceso
    access_date = models.DateTimeField(_('fecha de acceso'), auto_now_add=True)
    
    # Información adicional
    ip_address = models.GenericIPAddressField(_('dirección IP'), null=True, blank=True)
    user_agent = models.TextField(_('agente de usuario'), blank=True)
    
    class Meta:
        verbose_name = _('acceso a documento')
        verbose_name_plural = _('accesos a documentos')
        ordering = ['-access_date']
    
    def __str__(self):
        return f"{self.user} - {self.document} ({self.get_access_type_display()})"


class DocumentComment(models.Model):
    """
    Modelo para comentarios en documentos.
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('documento')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='document_comments',
        verbose_name=_('usuario')
    )
    
    # Contenido del comentario
    content = models.TextField(_('contenido'))
    
    # Campos para auditoría
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('comentario de documento')
        verbose_name_plural = _('comentarios de documentos')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Comentario de {self.user} en {self.document}"


class DocumentRating(models.Model):
    """
    Modelo para calificaciones de documentos.
    """
    document = models.ForeignKey(
        Document,
        on_delete=models.CASCADE,
        related_name='ratings',
        verbose_name=_('documento')
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='document_ratings',
        verbose_name=_('usuario')
    )
    
    # Calificación (1-5 estrellas)
    rating = models.PositiveSmallIntegerField(
        _('calificación'),
        choices=[
            (1, '★'),
            (2, '★★'),
            (3, '★★★'),
            (4, '★★★★'),
            (5, '★★★★★'),
        ]
    )
    
    # Campos para auditoría
    created_at = models.DateTimeField(_('fecha de creación'), auto_now_add=True)
    updated_at = models.DateTimeField(_('fecha de actualización'), auto_now=True)
    
    class Meta:
        verbose_name = _('calificación de documento')
        verbose_name_plural = _('calificaciones de documentos')
        unique_together = ['document', 'user']
    
    def __str__(self):
        return f"{self.user} calificó {self.document} con {self.rating} estrellas"
