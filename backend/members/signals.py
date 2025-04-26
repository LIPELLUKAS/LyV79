from django.db import connection
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.utils import ProgrammingError # Import ProgrammingError

from .models import MemberProfile, Attendance, MemberProgress

User = get_user_model()

@receiver(post_save, sender=User)
def create_member_profile(sender, instance, created, **kwargs):
    """
    Crea automáticamente un perfil para cada nuevo usuario,
    solo si la tabla MemberProfile ya existe (evita errores durante las migraciones iniciales).
    """
    if created:
        # Check if the table exists before trying to create the profile
        # This prevents errors during initial migrations when guardian creates the anonymous user
        table_name = MemberProfile._meta.db_table
        try:
            # Use introspection to check if the table exists
            if table_name not in connection.introspection.table_names():
                print(f"Skipping MemberProfile creation for user {instance.pk}: table {table_name} does not exist yet (likely during initial migration).")
                return # Exit the function if the table doesn't exist
        except Exception as e:
             # Handle potential exceptions during introspection
             print(f"Warning: Could not check existence of table {table_name} via introspection. Error: {e}")
             # As a fallback, you might try the cursor method or decide to proceed cautiously
             # For now, let's prevent creation if introspection fails unexpectedly
             return

        # If the table exists (or introspection check passed/failed gracefully), proceed to create the profile
        try:
            MemberProfile.objects.create(user=instance)
            print(f"Created MemberProfile for user {instance.pk}.")
        except Exception as e:
            print(f"Error creating MemberProfile for user {instance.pk}: {e}")
            # Handle potential errors during profile creation itself


@receiver(post_save, sender=Attendance)
def update_attendance_stats(sender, instance, created, **kwargs):
    """
    Actualiza las estadísticas de asistencia en el perfil del miembro.
    """
    if created and instance.is_present:
        # Actualizar la fecha de última asistencia y el contador
        # Use get_or_create cautiously if the table might not exist, but here it should be safer
        profile, profile_created = MemberProfile.objects.get_or_create(user=instance.user)
        
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

