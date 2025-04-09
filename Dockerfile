# Imagen base
FROM node:18-alpine

# Instala ffmpeg y otras dependencias necesarias
RUN apk add --no-cache ffmpeg

# Establece el directorio de trabajo
WORKDIR /app

# Copia archivo de variables de entorno
COPY .env .env

# Copia archivos de dependencias y los instala
COPY package*.json ./
RUN npm install

# Copia el resto del proyecto
COPY . .

# Expone el puerto de la app
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
