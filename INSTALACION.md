# Guía de Instalación - Sistema de Gestión Masónica "Luz y Verdad"

Esta guía proporciona instrucciones detalladas para instalar y configurar el Sistema de Gestión Masónica "Luz y Verdad" en diferentes entornos.

## Requisitos Previos

### Requisitos de Hardware
- **Servidor**: 2 CPU cores, 4GB RAM mínimo (recomendado 4 CPU cores, 8GB RAM)
- **Almacenamiento**: 20GB mínimo
- **Conexión a Internet**: Para actualizaciones y servicios externos

### Requisitos de Software
- **Sistema Operativo**: Ubuntu 20.04 LTS o superior (recomendado), CentOS 8+, Debian 10+
- **Docker**: versión 20.10 o superior
- **Docker Compose**: versión 2.0 o superior
- **Git**: Para clonar el repositorio

## Instalación con Docker (Recomendada)

### 1. Preparación del Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Añadir usuario actual al grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalaciones
docker --version
docker-compose --version
```

### 2. Clonar el Repositorio

```bash
# Crear directorio para la aplicación
mkdir -p /opt/luz_y_verdad
cd /opt/luz_y_verdad

# Clonar el repositorio
git clone https://github.com/organizacion/luz_y_verdad_code.git .
```

### 3. Configuración del Entorno

```bash
# Copiar archivo de variables de entorno
cp .env.example .env

# Editar variables de entorno
nano .env
```

Edite el archivo `.env` con la siguiente configuración mínima:

```
# Configuración de la Base de Datos
DB_NAME=luz_y_verdad
DB_USER=postgres
DB_PASSWORD=contraseña_segura
DB_HOST=db
DB_PORT=5432

# Configuración de Django
DJANGO_SECRET_KEY=clave_secreta_larga_y_aleatoria
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=dominio.com,www.dominio.com

# Configuración de Correo Electrónico
EMAIL_HOST=smtp.proveedor.com
EMAIL_PORT=587
EMAIL_HOST_USER=usuario@dominio.com
EMAIL_HOST_PASSWORD=contraseña_email
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=noreply@dominio.com

# Configuración de Seguridad
CORS_ALLOWED_ORIGINS=https://dominio.com
```

### 4. Despliegue con Docker Compose

```bash
# Construir e iniciar los contenedores
docker-compose build
docker-compose up -d

# Verificar que los contenedores estén funcionando
docker-compose ps
```

### 5. Configuración Inicial de la Base de Datos

```bash
# Aplicar migraciones
docker-compose exec backend python manage.py migrate

# Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# Cargar datos iniciales (opcional)
docker-compose exec backend python manage.py loaddata initial_data
```

### 6. Configuración de Nginx (si no se usa el incluido en Docker)

Si desea utilizar un servidor Nginx existente en lugar del contenedor incluido:

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/luz_y_verdad
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name dominio.com www.dominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /opt/luz_y_verdad/static/;
    }

    location /media/ {
        alias /opt/luz_y_verdad/media/;
    }
}
```

Activar la configuración:

```bash
sudo ln -s /etc/nginx/sites-available/luz_y_verdad /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configuración de HTTPS con Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d dominio.com -d www.dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

## Instalación Manual (Sin Docker)

### 1. Preparación del Servidor

```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependencias
sudo apt install -y python3-pip python3-venv postgresql postgresql-contrib nginx git
```

### 2. Configuración de PostgreSQL

```bash
# Iniciar y habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Crear usuario y base de datos
sudo -u postgres psql -c "CREATE USER luz_y_verdad WITH PASSWORD 'contraseña_segura';"
sudo -u postgres psql -c "CREATE DATABASE luz_y_verdad OWNER luz_y_verdad;"
sudo -u postgres psql -c "ALTER USER luz_y_verdad CREATEDB;"
```

### 3. Clonar el Repositorio

```bash
# Crear directorio para la aplicación
mkdir -p /opt/luz_y_verdad
cd /opt/luz_y_verdad

# Clonar el repositorio
git clone https://github.com/organizacion/luz_y_verdad_code.git .
```

### 4. Configuración del Backend

```bash
# Crear entorno virtual
cd /opt/luz_y_verdad/backend
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Copiar archivo de variables de entorno
cp ../.env.example .env

# Editar variables de entorno
nano .env
```

Edite el archivo `.env` con la configuración adecuada para su entorno.

```bash
# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recopilar archivos estáticos
python manage.py collectstatic --no-input
```

### 5. Configuración del Frontend

```bash
# Instalar Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar dependencias del frontend
cd /opt/luz_y_verdad/frontend
npm install

# Construir el frontend
npm run build
```

### 6. Configuración de Gunicorn

```bash
# Instalar Gunicorn
cd /opt/luz_y_verdad/backend
source venv/bin/activate
pip install gunicorn

# Crear archivo de servicio systemd
sudo nano /etc/systemd/system/luz_y_verdad.service
```

Contenido del archivo:

```ini
[Unit]
Description=Luz y Verdad Gunicorn Daemon
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/luz_y_verdad/backend
ExecStart=/opt/luz_y_verdad/backend/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/opt/luz_y_verdad/luz_y_verdad.sock luz_y_verdad.wsgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Activar el servicio:

```bash
sudo systemctl start luz_y_verdad
sudo systemctl enable luz_y_verdad
```

### 7. Configuración de Nginx

```bash
# Crear configuración de Nginx
sudo nano /etc/nginx/sites-available/luz_y_verdad
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name dominio.com www.dominio.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /opt/luz_y_verdad/backend;
    }
    
    location /media/ {
        root /opt/luz_y_verdad/backend;
    }
    
    location / {
        include proxy_params;
        proxy_pass http://unix:/opt/luz_y_verdad/luz_y_verdad.sock;
    }
}
```

Activar la configuración:

```bash
sudo ln -s /etc/nginx/sites-available/luz_y_verdad /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 8. Configuración de HTTPS con Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d dominio.com -d www.dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

## Verificación de la Instalación

1. Acceda a la aplicación a través de su dominio configurado.
2. Inicie sesión con las credenciales del superusuario creado.
3. Verifique que todos los módulos estén funcionando correctamente.
4. Revise los logs para detectar posibles errores:

```bash
# Logs de Docker
docker-compose logs -f

# Logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Logs de Gunicorn (instalación manual)
sudo journalctl -u luz_y_verdad
```

## Solución de Problemas Comunes

### Error de Conexión a la Base de Datos

```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Verificar conexión a la base de datos
sudo -u postgres psql -c "\l" | grep luz_y_verdad
```

### Problemas de Permisos

```bash
# Corregir permisos de archivos
sudo chown -R www-data:www-data /opt/luz_y_verdad
sudo chmod -R 755 /opt/luz_y_verdad
```

### Errores en el Frontend

```bash
# Verificar logs de construcción
cd /opt/luz_y_verdad/frontend
npm run build --verbose
```

### Problemas con Nginx

```bash
# Verificar sintaxis de configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## Actualización del Sistema

### Actualización con Docker

```bash
cd /opt/luz_y_verdad
git pull
docker-compose down
docker-compose build
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### Actualización Manual

```bash
cd /opt/luz_y_verdad
git pull

# Actualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --no-input
sudo systemctl restart luz_y_verdad

# Actualizar frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart nginx
```

---

Para asistencia técnica, contacte a soporte@luzyverda.org o llame al +1-234-567-8900.

© 2025 Sistema de Gestión Masónica "Luz y Verdad". Todos los derechos reservados.
