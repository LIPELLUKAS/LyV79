FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json* ./

# Instalar dependencias (usar npm install para asegurar que las devDependencies se instalen)
# Usar --legacy-peer-deps para evitar problemas de compatibilidad
RUN npm install --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
# Asegurar que la construcción sea exitosa
RUN set -e && \
    echo "--- Ejecutando npm run build ---" && \
    npm run build && \
    echo "--- Build completado, verificando directorio dist ---" && \
    ls -la /app/dist && \
    echo "--- Contenido de dist verificado ---"

# Instalar servidor ligero para servir la aplicación (versión específica para mayor estabilidad)
RUN npm install -g serve@14.2.0

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación - configurado para escuchar en todas las interfaces
CMD ["serve", "-s", "dist", "-l", "tcp://0.0.0.0:3000", "--single"]

