import pytest
from django.conf import settings

def pytest_configure():
    settings.configure(
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': ':memory:',
            }
        },
        INSTALLED_APPS=[
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'django.contrib.messages',
            'rest_framework',
            'corsheaders',
            'guardian',
            'drf_yasg',
            'authentication',
            'communications',
            'core',
            'library',
            'members',
            'rituals',
            'treasury',
        ],
        SECRET_KEY='test-key-not-for-production',
        REST_FRAMEWORK={
            'DEFAULT_AUTHENTICATION_CLASSES': [
                'rest_framework.authentication.SessionAuthentication',
                'rest_framework.authentication.TokenAuthentication',
            ],
            'DEFAULT_PERMISSION_CLASSES': [
                'rest_framework.permissions.IsAuthenticated',
            ],
            'TEST_REQUEST_RENDERER_CLASSES': [
                'rest_framework.renderers.JSONRenderer',
                'rest_framework.renderers.MultiPartRenderer',
            ],
        },
        MIDDLEWARE=[
            'django.middleware.security.SecurityMiddleware',
            'django.contrib.sessions.middleware.SessionMiddleware',
            'corsheaders.middleware.CorsMiddleware',
            'django.middleware.common.CommonMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.contrib.messages.middleware.MessageMiddleware',
            'django.middleware.clickjacking.XFrameOptionsMiddleware',
        ],
        ROOT_URLCONF='luz_y_verdad.urls',
        AUTHENTICATION_BACKENDS=(
            'django.contrib.auth.backends.ModelBackend',
            'guardian.backends.ObjectPermissionBackend',
        ),
    )
    
    import django
    django.setup()
