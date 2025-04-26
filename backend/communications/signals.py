from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Event, Notification, NotificationRecipient, Message, MessageRecipient, Calendar, CalendarEvent
from members.models import Attendance

User = get_user_model()

@receiver(post_save, sender=Event)
def create_attendance_records(sender, instance, created, **kwargs):
    """
    Crea automáticamente registros de asistencia para todos los miembros elegibles
    cuando se crea un nuevo evento.
    """
    if created:
        # Obtener todos los usuarios con grado suficiente para asistir al evento
        eligible_users = User.objects.filter(
            degree__gte=instance.required_degree,
            is_active=True
        )
        
        # Crear registros de asistencia para cada usuario elegible
        for user in eligible_users:
            Attendance.objects.create(
                user=user,
                event=instance,
                is_present=False,  # Por defecto, marcar como ausente hasta que se registre la asistencia
                recorded_by=instance.created_by
            )

@receiver(post_save, sender=Event)
def notify_event_creation(sender, instance, created, **kwargs):
    """
    Crea automáticamente una notificación cuando se crea un nuevo evento.
    """
    if created:
        # Crear una notificación para el nuevo evento
        notification = Notification.objects.create(
            title=f"Nuevo evento: {instance.title}",
            content=f"Se ha programado un nuevo evento para el {instance.date}.\n\n{instance.description}",
            notification_type=Notification.EVENT,
            event=instance,
            created_by=instance.created_by
        )
        
        # Obtener todos los usuarios con grado suficiente para asistir al evento
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

@receiver(post_save, sender=NotificationRecipient)
def update_notification_read_status(sender, instance, **kwargs):
    """
    Actualiza la fecha de lectura cuando se marca una notificación como leída.
    """
    if instance.read and not instance.read_date:
        instance.read_date = timezone.now()
        # Guardar sin disparar la señal de nuevo para evitar recursión
        NotificationRecipient.objects.filter(pk=instance.pk).update(read_date=instance.read_date)

@receiver(post_save, sender=MessageRecipient)
def update_message_read_status(sender, instance, **kwargs):
    """
    Actualiza la fecha de lectura cuando se marca un mensaje como leído.
    """
    if instance.read and not instance.read_date:
        instance.read_date = timezone.now()
        # Guardar sin disparar la señal de nuevo para evitar recursión
        MessageRecipient.objects.filter(pk=instance.pk).update(read_date=instance.read_date)

@receiver(post_save, sender=Message)
def send_draft_message(sender, instance, **kwargs):
    """
    Actualiza la fecha de envío cuando un mensaje deja de ser borrador.
    """
    if not instance.is_draft and instance.send_date is None:
        # Actualizar la fecha de envío
        instance.send_date = timezone.now()
        # Guardar sin disparar la señal de nuevo para evitar recursión
        Message.objects.filter(pk=instance.pk).update(send_date=instance.send_date)

@receiver(post_save, sender=CalendarEvent)
def update_event_in_calendar(sender, instance, created, **kwargs):
    """
    Actualiza el evento en el calendario cuando cambia el evento original.
    """
    if not created:
        # Si el evento del calendario ya existe, asegurarse de que refleje
        # cualquier cambio en el evento original
        event = instance.event
        # No es necesario hacer nada aquí, ya que CalendarEvent tiene una
        # referencia directa al evento, por lo que los cambios se reflejan automáticamente
