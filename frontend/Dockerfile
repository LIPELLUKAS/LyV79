FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json* ./

# Instalar dependencias (usar npm install para asegurar que las devDependencies se instalen)
# Añadir --legacy-peer-deps si hay problemas de dependencias entre paquetes
RUN npm install

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
# Añadir set -e para salir si hay error y ls para verificar la creación de dist
RUN set -e && \
    echo "--- Ejecutando npm run build ---" && \
    npm run build && \
    echo "--- Build completado, verificando directorio dist ---" && \
    ls -la /app/dist && \
    echo "--- Contenido de dist verificado ---"

# Instalar servidor ligero para servir la aplicación
RUN npm install -g serve

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación - modificado para escuchar en todas las interfaces
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000", "--single"]

