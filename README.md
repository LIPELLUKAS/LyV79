# Sistema de Gestión Masónica "Luz y Verdad"

## Descripción General

El Sistema de Gestión Masónica "Luz y Verdad" es una aplicación web completa diseñada para ayudar a las logias masónicas a gestionar sus actividades, miembros, finanzas y comunicaciones. La aplicación consta de un backend desarrollado en Django (Python) y un frontend desarrollado en React.

## Estructura del Proyecto

El proyecto está organizado en los siguientes directorios principales:

```
luz_y_verdad_code/
├── backend/            # API REST en Django
├── frontend/           # Aplicación React
├── nginx/              # Configuración de Nginx
├── .env                # Variables de entorno
├── docker-compose.yml  # Configuración de Docker
└── deploy.sh           # Script de despliegue
```

## Módulos Principales

El sistema incluye los siguientes módulos:

1. **Autenticación**: Gestión de usuarios, roles y permisos.
2. **Miembros**: Registro y gestión de miembros de la logia.
3. **Tesorería**: Control de ingresos, gastos y cuotas.
4. **Comunicaciones**: Sistema de anuncios y mensajería interna.
5. **Rituales**: Programación y gestión de ceremonias y reuniones.
6. **Biblioteca**: Gestión de libros y documentos.
7. **Administración**: Configuraciones generales y registros del sistema.

## Requisitos Técnicos

### Backend
- Python 3.8+
- Django 3.2+
- Django REST Framework
- PostgreSQL
- Otras dependencias listadas en `backend/requirements.txt`

### Frontend
- Node.js 14+
- React 17+
- Vite
- Tailwind CSS
- Otras dependencias listadas en `frontend/package.json`

### Infraestructura
- Docker y Docker Compose
- Nginx
- Sistema operativo Linux (recomendado)

## Instalación y Configuración

### Usando Docker (Recomendado)

1. Clone el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd luz_y_verdad_code
   ```

2. Configure las variables de entorno:
   ```bash
   cp .env.example .env
   # Edite el archivo .env con sus configuraciones
   ```

3. Inicie los contenedores:
   ```bash
   docker-compose up -d
   ```

4. Acceda a la aplicación:
   - Frontend: http://localhost:80
   - API Backend: http://localhost:80/api/
   - Documentación API: http://localhost:80/api/docs/

### Instalación Manual

#### Backend

1. Cree y active un entorno virtual:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

2. Instale las dependencias:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure la base de datos:
   ```bash
   python manage.py migrate
   ```

4. Cree un superusuario:
   ```bash
   python manage.py createsuperuser
   ```

5. Inicie el servidor:
   ```bash
   python manage.py runserver
   ```

#### Frontend

1. Instale las dependencias:
   ```bash
   cd frontend
   npm install
   ```

2. Configure las variables de entorno:
   ```bash
   cp .env.example .env
   # Edite el archivo .env con la URL de su API
   ```

3. Inicie el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Uso del Sistema

### Acceso al Sistema

1. Acceda a la aplicación a través de la URL configurada.
2. Inicie sesión con las credenciales proporcionadas por el administrador.

### Navegación Principal

El sistema está organizado en módulos accesibles desde el menú lateral:

- **Dashboard**: Resumen general y accesos rápidos.
- **Miembros**: Gestión de miembros de la logia.
- **Tesorería**: Control financiero.
- **Comunicaciones**: Anuncios y mensajería.
- **Rituales**: Calendario y gestión de ceremonias.
- **Biblioteca**: Acceso a documentos y libros.
- **Administración**: Configuraciones del sistema.

## Funcionalidades por Módulo

### Módulo de Miembros

- Registro de nuevos miembros
- Gestión de perfiles
- Seguimiento de grados y progresión
- Directorio de miembros
- Filtros y búsqueda avanzada

### Módulo de Tesorería

- Registro de ingresos y gastos
- Control de cuotas
- Generación de informes financieros
- Presupuestos
- Recordatorios de pagos

### Módulo de Comunicaciones

- Anuncios generales
- Mensajería privada entre miembros
- Notificaciones
- Archivos adjuntos

### Módulo de Rituales

- Programación de ceremonias
- Gestión de asistencia
- Asignación de oficiales
- Calendario de eventos
- Documentos rituales

### Módulo de Biblioteca

- Catálogo de libros
- Repositorio de documentos
- Sistema de préstamos
- Categorización y etiquetado
- Búsqueda por metadatos

### Módulo de Administración

- Configuraciones generales
- Gestión de usuarios y permisos
- Registros de actividad
- Copias de seguridad
- Personalización

## Seguridad

El sistema implementa múltiples capas de seguridad:

- Autenticación basada en tokens JWT
- Permisos granulares basados en roles
- Cifrado de datos sensibles
- Protección CSRF
- Validación de entradas
- Registros de auditoría

## Mantenimiento

### Copias de Seguridad

Se recomienda realizar copias de seguridad periódicas de:

1. Base de datos:
   ```bash
   docker-compose exec db pg_dump -U postgres luz_y_verdad > backup_$(date +%Y%m%d).sql
   ```

2. Archivos subidos:
   ```bash
   tar -czf media_backup_$(date +%Y%m%d).tar.gz backend/media/
   ```

### Actualizaciones

Para actualizar el sistema:

1. Respalde la base de datos y archivos.
2. Detenga los contenedores:
   ```bash
   docker-compose down
   ```
3. Actualice el código:
   ```bash
   git pull
   ```
4. Reconstruya los contenedores:
   ```bash
   docker-compose build
   ```
5. Inicie los contenedores:
   ```bash
   docker-compose up -d
   ```
6. Aplique las migraciones:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

## Solución de Problemas

### Problemas Comunes

1. **Error de conexión a la base de datos**:
   - Verifique las credenciales en el archivo `.env`
   - Confirme que el servicio de PostgreSQL esté en ejecución

2. **Errores 500 en la API**:
   - Revise los logs del backend:
     ```bash
     docker-compose logs backend
     ```

3. **Pantalla en blanco en el frontend**:
   - Verifique la consola del navegador para errores
   - Confirme que la URL de la API esté correctamente configurada

4. **Problemas de permisos**:
   - Verifique que el usuario tenga los roles adecuados
   - Revise la configuración de permisos en el panel de administración

## Contacto y Soporte

Para soporte técnico o consultas, contacte a:

- Email: soporte@luzyverda.org
- Teléfono: +1-234-567-8900

---

© 2025 Sistema de Gestión Masónica "Luz y Verdad". Todos los derechos reservados.
