"""
URL configuration for luz_y_verdad project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.reverse import reverse
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Vista para la raíz de la API (/api/)
# Simplificada para evitar timeouts causados por múltiples llamadas a reverse()
class ApiRootView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, format=None):
        # Retorna las URLs base de cada módulo en lugar de resolver endpoints específicos
        # Esto es mucho más eficiente y evita timeouts.
        return Response({
            'auth': request.build_absolute_uri('auth/'),
            'members': request.build_absolute_uri('members/'),
            'treasury': request.build_absolute_uri('treasury/'),
            'communications': request.build_absolute_uri('communications/'),
            'rituals': request.build_absolute_uri('rituals/'),
            'library': request.build_absolute_uri('library/'),
            'core': request.build_absolute_uri('core/'),
            'docs': {
                'swagger': request.build_absolute_uri(reverse('schema-swagger-ui', request=request, format=format)),
                'redoc': request.build_absolute_uri(reverse('schema-redoc', request=request, format=format)),
            }
        })

# Configuración de Swagger/OpenAPI
schema_view = get_schema_view(
   openapi.Info(
      title="Luz y Verdad API",
      default_version='v1',
      description="API para el Sistema de Gestión Masónica Luz y Verdad",
      terms_of_service="https://www.luz-y-verdad.org/terms/",
      contact=openapi.Contact(email="admin@luz-y-verdad.org"),
      license=openapi.License(name="Licencia Privada"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Raíz de la API
    path('api/', ApiRootView.as_view(), name='api-root'),
    # Módulos de la API
    path('api/auth/', include('authentication.urls')),
    path('api/members/', include('members.urls')),
    path('api/treasury/', include('treasury.urls')),
    path('api/communications/', include('communications.urls')),
    path('api/rituals/', include('rituals.urls')),
    path('api/library/', include('library.urls')),
    path('api/core/', include('core.urls')),

    # Documentación de la API
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

