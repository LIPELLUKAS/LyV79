#!/bin/bash

# Script de despliegue para el Sistema de Gestión Masónica "Luz y Verdad"
# Este script prepara y despliega la aplicación en un entorno de producción

echo "=== Iniciando despliegue del Sistema de Gestión Masónica 'Luz y Verdad' ==="
echo ""

# Directorio base del proyecto
BASE_DIR="$(pwd)"
cd $BASE_DIR

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes de estado
show_status() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ ÉXITO${NC}: $2"
  else
    echo -e "${RED}✗ ERROR${NC}: $2"
    exit 1
  fi
}

# Verificar si el archivo .env existe
if [ ! -f "$BASE_DIR/.env" ]; then
  echo -e "${YELLOW}Archivo .env no encontrado. Creando a partir de .env.example...${NC}"
  cp $BASE_DIR/.env.example $BASE_DIR/.env
  echo -e "${YELLOW}Por favor, edite el archivo .env con sus configuraciones antes de continuar.${NC}"
  echo -e "${YELLOW}Presione Enter para continuar después de editar el archivo, o Ctrl+C para cancelar.${NC}"
  read
fi

# Verificar si los directorios necesarios existen
echo "Verificando estructura de directorios..."
mkdir -p $BASE_DIR/nginx/ssl
mkdir -p $BASE_DIR/backend/staticfiles
mkdir -p $BASE_DIR/backend/media
show_status $? "Estructura de directorios verificada"

# Verificar si los certificados SSL existen
if [ ! -f "$BASE_DIR/nginx/ssl/luz-y-verdad.crt" ] || [ ! -f "$BASE_DIR/nginx/ssl/luz-y-verdad.key" ]; then
  echo -e "${YELLOW}Certificados SSL no encontrados. Generando certificados autofirmados para desarrollo...${NC}"
  echo -e "${YELLOW}En producción, reemplace estos con certificados reales de una autoridad certificadora.${NC}"
  
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $BASE_DIR/nginx/ssl/luz-y-verdad.key \
    -out $BASE_DIR/nginx/ssl/luz-y-verdad.crt \
    -subj "/C=ES/ST=Madrid/L=Madrid/O=Logia Luz y Verdad/OU=IT/CN=luz-y-verdad.org"
  
  show_status $? "Generación de certificados SSL autofirmados"
fi

# Verificar si el archivo requirements.txt existe en el backend
if [ ! -f "$BASE_DIR/backend/requirements.txt" ]; then
  echo "Generando archivo requirements.txt para el backend..."
  cat > $BASE_DIR/backend/requirements.txt << EOF
Django==5.2
djangorestframework==3.16.0
djangorestframework-simplejwt==5.3.0
django-cors-headers==4.3.0
django-filter==23.3
django-guardian==2.4.0
django-otp==1.2.2
django-two-factor-auth==1.15.3
psycopg2-binary==2.9.9
celery==5.3.4
redis==5.0.1
gunicorn==21.2.0
whitenoise==6.5.0
Pillow==10.1.0
python-dotenv==1.0.0
pytest==7.4.3
pytest-django==4.7.0
pytest-cov==4.1.0
EOF
  show_status $? "Generación de requirements.txt para el backend"
fi

# Construir y levantar los contenedores
echo "Construyendo y levantando los contenedores Docker..."
docker-compose build
show_status $? "Construcción de contenedores Docker"

echo "Iniciando los servicios..."
docker-compose up -d
show_status $? "Inicio de servicios Docker"

# Esperar a que la base de datos esté lista
echo "Esperando a que la base de datos esté lista..."
sleep 10

# Ejecutar migraciones y crear superusuario
echo "Ejecutando migraciones de Django..."
docker-compose exec backend python manage.py migrate
show_status $? "Migraciones de Django"

# Verificar si existe un superusuario
echo "Verificando si existe un superusuario..."
SUPERUSER_EXISTS=$(docker-compose exec backend python -c "import django; django.setup(); from authentication.models import MasonicUser; print(MasonicUser.objects.filter(is_superuser=True).exists())")

if [ "$SUPERUSER_EXISTS" = "False" ]; then
  echo "Creando superusuario..."
  # Generar contraseña aleatoria
  RANDOM_PASSWORD=$(openssl rand -base64 12)
  docker-compose exec backend python manage.py shell -c "
from authentication.models import MasonicUser;
MasonicUser.objects.create_superuser(
  username=\'admin\',
  email=\'admin@luz-y-verdad.org\',
  password=\'${RANDOM_PASSWORD}\',
  first_name=\'Administrador\',
  last_name=\'Sistema\',
  symbolic_name=\'Venerable Maestro\',
  degree=3,
  office=\'Venerable Maestro\'
)
print(\'Superusuario creado con éxito.\')
"
  show_status $? "Creación de superusuario"
  echo -e "${YELLOW}Superusuario creado con las siguientes credenciales:${NC}"
  echo -e "${YELLOW}Usuario: admin${NC}"
  echo -e "${YELLOW}Contraseña: ${RANDOM_PASSWORD}${NC}"
  echo -e "${YELLOW}¡Guarde esta contraseña de forma segura!${NC}"
else
  echo -e "${GREEN}El superusuario ya existe.${NC}"
fi

# Recolectar archivos estáticos
echo "Recolectando archivos estáticos..."
docker-compose exec backend python manage.py collectstatic --no-input
show_status $? "Recolección de archivos estáticos"

# Verificar el estado de los servicios
echo "Verificando el estado de los servicios..."
docker-compose ps
show_status $? "Verificación de servicios"

echo ""
echo -e "${GREEN}=== Despliegue completado con éxito ===${NC}"
echo ""
echo "El Sistema de Gestión Masónica 'Luz y Verdad' está ahora disponible en:"
echo -e "${GREEN}https://luz-y-verdad.org${NC} (Asegúrese de que este dominio apunte a su servidor)"
echo ""
echo "Para acceder al panel de administración, visite:"
echo -e "${GREEN}https://luz-y-verdad.org/admin${NC}"
echo ""
echo "Para detener los servicios, ejecute:"
echo "docker-compose down"
echo ""
echo "Para reiniciar los servicios, ejecute:"
echo "docker-compose restart"
echo ""
echo "Para ver los logs, ejecute:"
echo "docker-compose logs -f"
echo ""
