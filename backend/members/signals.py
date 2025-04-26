from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import MemberProfile, Attendance, MemberProgress

User = get_user_model()

@receiver(post_save, sender=User)
def create_member_profile(sender, instance, created, **kwargs):
    """
    Crea automáticamente un perfil para cada nuevo usuario.
    """
    if created:
        MemberProfile.objects.create(user=instance)

@receiver(post_save, sender=Attendance)
def update_attendance_stats(sender, instance, created, **kwargs):
    """
    Actualiza las estadísticas de asistencia en el perfil del miembro.
    """
    if created and instance.is_present:
        # Actualizar la fecha de última asistencia y el contador
        profile, created = MemberProfile.objects.get_or_create(user=instance.user)
        
        # Actualizar la fecha de última asistencia si es más reciente
        event_date = instance.event.date
        if not profile.last_attendance_date or event_date > profile.last_attendance_date:
            profile.last_attendance_date = event_date
        
        # Incrementar el contador de asistencias
        profile.attendance_count += 1
        profile.save()

@receiver(post_save, sender=MemberProgress)
def update_user_degree(sender, instance, created, **kwargs):
    """
    Actualiza el grado del usuario si el progreso registrado corresponde a un cambio de grado.
    """
    if created:
        user = instance.user
        title_lower = instance.title.lower()
        
        # Verificar si el título del progreso indica un cambio de grado
        if 'iniciación' in title_lower or 'iniciado' in title_lower:
            # Asegurarse de que la fecha de iniciación esté establecida
            if not user.initiation_date or instance.date < user.initiation_date:
                user.initiation_date = instance.date
                user.degree = max(user.degree, 1)  # Asegurarse de que el grado sea al menos 1
                user.save()
                
        elif 'elevación' in title_lower or 'elevado' in title_lower or 'segundo grado' in title_lower:
            # Asegurarse de que la fecha de elevación esté establecida
            if not user.passing_date or instance.date < user.passing_date:
                user.passing_date = instance.date
                user.degree = max(user.degree, 2)  # Asegurarse de que el grado sea al menos 2
                user.save()
                
        elif 'exaltación' in title_lower or 'exaltado' in title_lower or 'tercer grado' in title_lower:
            # Asegurarse de que la fecha de exaltación esté establecida
            if not user.raising_date or instance.date < user.raising_date:
                user.raising_date = instance.date
                user.degree = max(user.degree, 3)  # Asegurarse de que el grado sea al menos 3
                user.save()
