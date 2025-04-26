from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from guardian.shortcuts import assign_perm

from .models import MasonicUser, OfficerRole

@receiver(post_save, sender=MasonicUser)
def assign_user_permissions(sender, instance, created, **kwargs):
    """
    Asigna permisos basados en el grado masónico y el cargo oficial del usuario.
    """
    if created:
        # Asignar permisos básicos para todos los usuarios
        basic_permissions = [
            'view_memberprofile',
            'view_event',
            'view_notification',
        ]
        
        for perm in basic_permissions:
            assign_perm(perm, instance)
    
    # Asignar permisos basados en el grado
    if instance.degree >= MasonicUser.APPRENTICE:
        apprentice_permissions = [
            'view_document',
        ]
        for perm in apprentice_permissions:
            assign_perm(perm, instance)
    
    if instance.degree >= MasonicUser.FELLOW_CRAFT:
        fellow_permissions = [
            'add_document',
        ]
        for perm in fellow_permissions:
            assign_perm(perm, instance)
    
    if instance.degree >= MasonicUser.MASTER:
        master_permissions = [
            'view_ritualplan',
            'view_payment',
        ]
        for perm in master_permissions:
            assign_perm(perm, instance)

@receiver(post_save, sender=OfficerRole)
def assign_officer_permissions(sender, instance, created, **kwargs):
    """
    Asigna permisos basados en el cargo oficial del usuario.
    """
    user = instance.user
    
    # Limpiar permisos anteriores de cargos oficiales
    officer_groups = Group.objects.filter(name__in=[
        'Venerable Maestro',
        'Primer Vigilante',
        'Segundo Vigilante',
        'Secretario',
        'Tesorero',
    ])
    
    for group in officer_groups:
        user.groups.remove(group)
    
    # Asignar nuevo grupo según el cargo
    if instance.is_active:
        if instance.role == OfficerRole.WORSHIPFUL_MASTER:
            group, _ = Group.objects.get_or_create(name='Venerable Maestro')
            user.groups.add(group)
            
            # Permisos específicos para el Venerable Maestro
            vm_permissions = [
                'add_ritualplan', 'change_ritualplan', 'delete_ritualplan',
                'approve_ritualplan',
                'view_systemlog', 'view_errorlog',
                'view_financialreport',
            ]
            for perm in vm_permissions:
                assign_perm(perm, user)
                
        elif instance.role == OfficerRole.SENIOR_WARDEN:
            group, _ = Group.objects.get_or_create(name='Primer Vigilante')
            user.groups.add(group)
            
            # Permisos específicos para el Primer Vigilante
            pv_permissions = [
                'add_ritualplan', 'change_ritualplan',
                'view_memberprofile',
            ]
            for perm in pv_permissions:
                assign_perm(perm, user)
                
        elif instance.role == OfficerRole.JUNIOR_WARDEN:
            group, _ = Group.objects.get_or_create(name='Segundo Vigilante')
            user.groups.add(group)
            
            # Permisos específicos para el Segundo Vigilante
            sv_permissions = [
                'add_ritualplan', 'change_ritualplan',
                'view_memberprofile',
            ]
            for perm in sv_permissions:
                assign_perm(perm, user)
                
        elif instance.role == OfficerRole.SECRETARY:
            group, _ = Group.objects.get_or_create(name='Secretario')
            user.groups.add(group)
            
            # Permisos específicos para el Secretario
            sec_permissions = [
                'add_memberprofile', 'change_memberprofile',
                'add_notification', 'change_notification', 'delete_notification',
                'add_event', 'change_event', 'delete_event',
                'add_document', 'change_document',
                'add_ritualminutes', 'change_ritualminutes',
            ]
            for perm in sec_permissions:
                assign_perm(perm, user)
                
        elif instance.role == OfficerRole.TREASURER:
            group, _ = Group.objects.get_or_create(name='Tesorero')
            user.groups.add(group)
            
            # Permisos específicos para el Tesorero
            tes_permissions = [
                'add_fee', 'change_fee', 'delete_fee',
                'add_payment', 'change_payment', 'delete_payment',
                'add_invoice', 'change_invoice',
                'add_financialreport', 'change_financialreport',
            ]
            for perm in tes_permissions:
                assign_perm(perm, user)
