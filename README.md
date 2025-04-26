# Sistema de Gestión Masónica "Luz y Verdad"

## Documentación del Sistema

### Introducción

El Sistema de Gestión Masónica "Luz y Verdad" es una plataforma integral diseñada específicamente para cubrir las necesidades administrativas, financieras, ritualísticas y organizacionales de una Logia Masónica. Inspirado en modelos de gestión eclesiástica, el sistema busca potenciar la eficiencia institucional, preservar el orden jerárquico tradicional y fortalecer la comunicación interna entre los Hermanos, mediante herramientas tecnológicas modernas y seguras.

### Arquitectura del Sistema

El sistema cuenta con dos entornos principales:

1. **Backend**: Desarrollado con Django y Django REST Framework, utilizando PostgreSQL como base de datos.
2. **Frontend**: Desarrollado con React y Vite, utilizando Tailwind CSS para el diseño de la interfaz.

### Módulos del Sistema

#### 1. Autenticación y Seguridad

- Sistema de autenticación con JWT
- Autenticación de dos factores (2FA)
- Control de acceso basado en roles y grados masónicos
- Gestión de perfiles de usuario

#### 2. Gestión de Miembros

- Registro y gestión de miembros
- Seguimiento de progresión masónica
- Gestión de documentos personales
- Registro de asistencia

#### 3. Tesorería

- Gestión de cuotas y pagos
- Generación de facturas
- Seguimiento de pagos pendientes
- Informes financieros

#### 4. Comunicaciones

- Centro de notificaciones
- Gestión de eventos
- Mensajería interna
- Calendario compartido

#### 5. Planificación Ritual

- Programación de tenidas
- Asignación de roles rituales
- Gestión de trabajos masónicos
- Registro de actas

#### 6. Biblioteca Digital

- Organización jerárquica de documentos
- Control de acceso basado en grados
- Sistema de calificaciones y comentarios
- Estadísticas de visualización

#### 7. Administración

- Configuración de la Logia
- Registros del sistema
- Gestión de respaldos
- Monitoreo de salud del sistema

### Requisitos del Sistema

#### Requisitos de Hardware

- Servidor con al menos 2GB de RAM
- 20GB de espacio en disco
- Procesador de 2 núcleos o superior

#### Requisitos de Software

- Docker y Docker Compose
- Nginx (para producción)
- Certificado SSL (para producción)

### Instalación y Configuración

#### Instalación Local para Desarrollo

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/LIPELLUKAS/LyV79.git
   cd LyV79
   ```

2. Configurar el entorno:
   ```bash
   cp .env.example .env
   # Editar el archivo .env con los valores adecuados
   ```

3. Iniciar el backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

4. Iniciar el frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

#### Instalación en Producción con Docker

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/LIPELLUKAS/LyV79.git
   cd LyV79
   ```

2. Configurar el entorno:
   ```bash
   cp .env.example .env
   # Editar el archivo .env con los valores adecuados para producción
   ```

3. Iniciar los contenedores:
   ```bash
   docker-compose up -d
   ```

4. Crear superusuario:
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

### Guía de Uso

#### Acceso al Sistema

1. Acceder a la URL del sistema (http://localhost:3000 en desarrollo o su dominio en producción)
2. Iniciar sesión con las credenciales proporcionadas
3. Para el primer acceso, utilizar las credenciales del superusuario creado durante la instalación

#### Navegación Principal

- **Dashboard**: Vista general con estadísticas y accesos rápidos
- **Miembros**: Gestión de miembros de la Logia
- **Tesorería**: Gestión financiera
- **Comunicaciones**: Notificaciones, eventos y mensajería
- **Rituales**: Planificación de tenidas y trabajos
- **Biblioteca**: Documentos y recursos masónicos
- **Administración**: Configuración y mantenimiento del sistema

### Roles y Permisos

- **Venerable Maestro**: Acceso completo a todos los módulos
- **Vigilantes**: Acceso a todos los módulos excepto administración
- **Secretario**: Acceso a miembros, comunicaciones y rituales
- **Tesorero**: Acceso a tesorería y miembros
- **Miembros**: Acceso limitado según su grado masónico

### Mantenimiento del Sistema

#### Respaldos

El sistema incluye un módulo de respaldos que permite:
- Configurar respaldos automáticos
- Crear respaldos manuales
- Restaurar respaldos anteriores

#### Monitoreo

El módulo de salud del sistema proporciona:
- Estadísticas de uso de recursos
- Monitoreo de servicios
- Alertas de problemas

#### Registros del Sistema

Los registros del sistema permiten:
- Seguimiento de actividades
- Detección de errores
- Auditoría de seguridad

### Soporte y Contacto

Para soporte técnico o consultas sobre el sistema, contactar a:
- Email: soporte@luzverdad.org
- Teléfono: +XX XXX XXX XXX

### Licencia

Este sistema está licenciado bajo términos específicos para uso exclusivo de Logias Masónicas. No se permite su redistribución o uso comercial sin autorización expresa.

---

© 2025 Sistema de Gestión Masónica "Luz y Verdad" - Todos los derechos reservados
