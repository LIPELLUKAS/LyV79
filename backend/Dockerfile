FROM python:3.11-slim

# Establecer directorio de trabajo
WORKDIR /app

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=luz_y_verdad.settings

# Instalar dependencias del sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        gettext \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copiar el proyecto
COPY . /app/

# Crear directorios para archivos estáticos y media
RUN mkdir -p /app/staticfiles /app/media

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["gunicorn", "luz_y_verdad.wsgi:application", "--bind", "0.0.0.0:8000"]
