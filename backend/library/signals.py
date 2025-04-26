from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings

from .models import DocumentCategory, Document, DocumentAccess, DocumentComment, DocumentRating
from communications.models import Notification, NotificationRecipient

User = get_user_model()

@receiver(post_save, sender=Document)
def notify_new_document(sender, instance, created, **kwargs):
    """
    Crea notificaciones cuando se sube un nuevo documento.
    """
    if created:
        # Crear una notificación para el nuevo documento
        notification = Notification.objects.create(
            title=f"Nuevo documento en biblioteca: {instance.title}",
            content=f"Se ha añadido un nuevo documento '{instance.title}' a la biblioteca digital en la categoría '{instance.category.name if instance.category else 'Sin categoría'}'.",
            notification_type=Notification.GENERAL,
            created_by=instance.uploaded_by
        )
        
        # Obtener todos los usuarios con grado suficiente para ver el documento
        eligible_users = User.objects.filter(
            degree__gte=instance.required_degree,
            is_active=True
        )
        
        # Asignar la notificación a todos los usuarios elegibles
        for user in eligible_users:
            NotificationRecipient.objects.create(
                notification=notification,
                recipient=user
            )

@receiver(post_save, sender=DocumentComment)
def notify_document_comment(sender, instance, created, **kwargs):
    """
    Notifica al autor del documento cuando se añade un comentario.
    """
    if created:
        document = instance.document
        
        # Si el comentario no es del autor del documento, notificar al autor
        if document.uploaded_by and document.uploaded_by != instance.user:
            # Crear una notificación para el autor del documento
            notification = Notification.objects.create(
                title=f"Nuevo comentario en: {document.title}",
                content=f"{instance.user.symbolic_name or instance.user.username} ha comentado en tu documento '{document.title}':\n\n{instance.content[:100]}{'...' if len(instance.content) > 100 else ''}",
                notification_type=Notification.GENERAL,
                created_by=instance.user
            )
            
            # Asignar la notificación al autor del documento
            NotificationRecipient.objects.create(
                notification=notification,
                recipient=document.uploaded_by
            )

@receiver(post_save, sender=DocumentRating)
def update_document_average_rating(sender, instance, **kwargs):
    """
    Actualiza la calificación promedio del documento cuando se añade o modifica una calificación.
    """
    document = instance.document
    
    # Calcular la calificación promedio
    ratings = document.ratings.all()
    if ratings:
        avg_rating = sum(r.rating for r in ratings) / len(ratings)
        # No hay un campo específico para almacenar el promedio en el modelo,
        # pero podría añadirse en el futuro si es necesario
    
    # Si la calificación no es del autor del documento, notificar al autor
    if kwargs.get('created') and document.uploaded_by and document.uploaded_by != instance.user:
        # Crear una notificación para el autor del documento
        notification = Notification.objects.create(
            title=f"Nueva calificación en: {document.title}",
            content=f"{instance.user.symbolic_name or instance.user.username} ha calificado tu documento '{document.title}' con {instance.rating} estrellas.",
            notification_type=Notification.GENERAL,
            created_by=instance.user
        )
        
        # Asignar la notificación al autor del documento
        NotificationRecipient.objects.create(
            notification=notification,
            recipient=document.uploaded_by
        )

@receiver(post_save, sender=DocumentCategory)
def update_subcategory_required_degree(sender, instance, **kwargs):
    """
    Asegura que las subcategorías no tengan un grado requerido menor que su categoría padre.
    """
    if instance.parent and instance.required_degree < instance.parent.required_degree:
        # Si el grado requerido es menor que el de la categoría padre, actualizarlo
        instance.required_degree = instance.parent.required_degree
        # Guardar sin disparar la señal de nuevo para evitar recursión
        DocumentCategory.objects.filter(pk=instance.pk).update(required_degree=instance.required_degree)
        
    # Actualizar todas las subcategorías para asegurar que cumplan con el grado mínimo
    if kwargs.get('update_fields') and 'required_degree' in kwargs.get('update_fields'):
        for subcategory in instance.subcategories.all():
            if subcategory.required_degree < instance.required_degree:
                subcategory.required_degree = instance.required_degree
                subcategory.save(update_fields=['required_degree'])

@receiver(post_save, sender=DocumentAccess)
def log_document_access(sender, instance, created, **kwargs):
    """
    Registra accesos a documentos para análisis de seguridad.
    """
    if created and settings.DEBUG:
        # En un entorno de producción, esto podría registrarse en un sistema de monitoreo
        print(f"Acceso a documento: {instance.document.title} por {instance.user.username} - {instance.access_type} - {instance.access_date}")
        
        # También podría enviarse un correo electrónico para accesos sospechosos
        # Por ejemplo, si un usuario descarga muchos documentos en poco tiempo
        if instance.access_type == DocumentAccess.DOWNLOAD:
            recent_downloads = DocumentAccess.objects.filter(
                user=instance.user,
                access_type=DocumentAccess.DOWNLOAD,
                access_date__gte=timezone.now() - timezone.timedelta(hours=1)
            ).count()
            
            if recent_downloads > 10:  # Umbral arbitrario para este ejemplo
                # Esto es solo un ejemplo, en producción se implementaría un sistema más robusto
                print(f"ALERTA: Usuario {instance.user.username} ha descargado {recent_downloads} documentos en la última hora.")
