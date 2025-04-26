from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .models import MasonicUser, OfficerRole

class OfficerRoleInline(admin.StackedInline):
    model = OfficerRole
    can_delete = True
    verbose_name_plural = 'Cargo Oficial'
    fk_name = 'user'

class MasonicUserAdmin(UserAdmin):
    inlines = (OfficerRoleInline,)
    list_display = ('username', 'symbolic_name', 'email', 'first_name', 'last_name', 'get_degree_display', 'is_active')
    list_filter = ('is_active', 'degree', 'two_factor_enabled')
    search_fields = ('username', 'symbolic_name', 'email', 'first_name', 'last_name')
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Información Personal'), {'fields': ('first_name', 'last_name', 'email', 'phone_number', 'address')}),
        (_('Información Masónica'), {'fields': ('symbolic_name', 'degree', 'initiation_date', 'passing_date', 'raising_date')}),
        (_('Seguridad'), {'fields': ('two_factor_enabled',)}),
        (_('Permisos'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Fechas importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2'),
        }),
        (_('Información Masónica'), {
            'classes': ('wide',),
            'fields': ('symbolic_name', 'degree'),
        }),
    )

admin.site.register(MasonicUser, MasonicUserAdmin)
admin.site.register(OfficerRole)
