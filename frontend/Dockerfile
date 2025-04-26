FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Instalar servidor ligero para servir la aplicación
RUN npm install -g serve

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["serve", "-s", "dist", "-l", "3000"]
