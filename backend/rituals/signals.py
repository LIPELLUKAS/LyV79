from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import RitualPlan, RitualRole, RitualWork, RitualMinutes, RitualAttachment
from communications.models import Event, Notification, NotificationRecipient

User = get_user_model()

@receiver(post_save, sender=RitualPlan)
def create_event_for_ritual_plan(sender, instance, created, **kwargs):
    """
    Crea automáticamente un evento asociado cuando se crea un plan ritual.
    """
    if created and not instance.event:
        # Crear un evento para el plan ritual
        event = Event.objects.create(
            title=f"Trabajo Ritual: {instance.title}",
            description=instance.description,
            date=instance.date,
            start_time=instance.start_time,
            end_time=instance.end_time,
            event_type=Event.TENIDA,
            required_degree=instance.degree,
            status=Event.SCHEDULED,
            created_by=instance.created_by
        )
        
        # Asociar el evento al plan ritual
        instance.event = event
        # Guardar sin disparar la señal de nuevo para evitar recursión
        RitualPlan.objects.filter(pk=instance.pk).update(event=event)

@receiver(post_save, sender=RitualPlan)
def notify_ritual_plan_status_change(sender, instance, **kwargs):
    """
    Crea notificaciones cuando cambia el estado de un plan ritual.
    """
    # Verificar si el estado ha cambiado
    if kwargs.get('update_fields') and 'status' in kwargs.get('update_fields'):
        status_display = instance.get_status_display()
        
        # Crear una notificación para el cambio de estado
        notification = Notification.objects.create(
            title=f"Plan Ritual: {instance.title} - {status_display}",
            content=f"El plan ritual '{instance.title}' programado para el {instance.date} ha cambiado su estado a '{status_display}'.",
            notification_type=Notification.RITUAL,
            event=instance.event,
            created_by=instance.approved_by or instance.created_by
        )
        
        # Obtener todos los usuarios con grado suficiente para el ritual
        eligible_users = User.objects.filter(
            degree__gte=instance.degree,
            is_active=True
        )
        
        # Asignar la notificación a todos los usuarios elegibles
        for user in eligible_users:
            NotificationRecipient.objects.create(
                notification=notification,
                recipient=user
            )

@receiver(post_save, sender=RitualRole)
def notify_ritual_role_assignment(sender, instance, **kwargs):
    """
    Notifica a un miembro cuando se le asigna un rol ritual.
    """
    # Verificar si se ha asignado un miembro al rol
    if instance.assigned_to and kwargs.get('update_fields') and 'assigned_to' in kwargs.get('update_fields'):
        role_name = instance.get_role_type_display()
        if instance.role_type == instance.OTHER and instance.custom_role:
            role_name = instance.custom_role
        
        # Crear una notificación para el miembro asignado
        notification = Notification.objects.create(
            title=f"Asignación de Rol: {role_name}",
            content=f"Has sido asignado al rol de '{role_name}' para el trabajo ritual '{instance.ritual_plan.title}' programado para el {instance.ritual_plan.date}.",
            notification_type=Notification.RITUAL,
            event=instance.ritual_plan.event,
            created_by=instance.ritual_plan.created_by
        )
        
        # Asignar la notificación al miembro asignado
        NotificationRecipient.objects.create(
            notification=notification,
            recipient=instance.assigned_to
        )

@receiver(post_save, sender=RitualWork)
def update_ritual_work_status(sender, instance, **kwargs):
    """
    Actualiza el estado de un trabajo ritual y notifica al responsable.
    """
    # Verificar si el estado ha cambiado
    if kwargs.get('update_fields') and 'status' in kwargs.get('update_fields'):
        # Si el trabajo tiene un responsable asignado, notificarle del cambio
        if instance.responsible:
            status_display = instance.get_status_display()
            
            # Crear una notificación para el responsable
            notification = Notification.objects.create(
                title=f"Trabajo Ritual: {instance.title} - {status_display}",
                content=f"El trabajo '{instance.title}' para el ritual '{instance.ritual_plan.title}' ha cambiado su estado a '{status_display}'.",
                notification_type=Notification.RITUAL,
                event=instance.ritual_plan.event,
                created_by=instance.ritual_plan.created_by
            )
            
            # Asignar la notificación al responsable
            NotificationRecipient.objects.create(
                notification=notification,
                recipient=instance.responsible
            )

@receiver(post_save, sender=RitualMinutes)
def update_ritual_plan_on_minutes_approval(sender, instance, **kwargs):
    """
    Actualiza el estado del plan ritual cuando se aprueban las actas.
    """
    if instance.status == RitualMinutes.APPROVED:
        ritual_plan = instance.ritual_plan
        
        # Si el plan ritual no está marcado como completado, actualizarlo
        if ritual_plan.status != RitualPlan.COMPLETED:
            ritual_plan.status = RitualPlan.COMPLETED
            ritual_plan.save(update_fields=['status'])

@receiver(post_save, sender=RitualAttachment)
def notify_ritual_attachment_upload(sender, instance, created, **kwargs):
    """
    Notifica a los miembros relevantes cuando se sube un nuevo adjunto ritual.
    """
    if created:
        ritual_plan = instance.ritual_plan
        
        # Crear una notificación para el nuevo adjunto
        notification = Notification.objects.create(
            title=f"Nuevo Adjunto Ritual: {instance.title}",
            content=f"Se ha subido un nuevo adjunto '{instance.title}' para el trabajo ritual '{ritual_plan.title}'.",
            notification_type=Notification.RITUAL,
            event=ritual_plan.event,
            created_by=instance.uploaded_by
        )
        
        # Obtener todos los usuarios con roles en el plan ritual
        role_users = User.objects.filter(
            ritual_roles__ritual_plan=ritual_plan
        ).distinct()
        
        # Asignar la notificación a todos los usuarios con roles
        for user in role_users:
            NotificationRecipient.objects.create(
                notification=notification,
                recipient=user
            )
