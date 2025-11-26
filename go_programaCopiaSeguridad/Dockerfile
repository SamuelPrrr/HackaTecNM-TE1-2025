# Multi-stage build para optimizar el tamaño de la imagen
FROM golang:1.25-alpine AS builder

# Instalar dependencias necesarias para Fyne
RUN apk add --no-cache \
    gcc \
    g++ \
    musl-dev \
    libx11-dev \
    libxcursor-dev \
    libxrandr-dev \
    libxinerama-dev \
    libxi-dev \
    libglvnd-dev \
    mesa-dev \
    libxxf86vm-dev

WORKDIR /app

# Copiar archivos de módulos y descargar dependencias
COPY go.mod go.sum ./
RUN go mod download

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN CGO_ENABLED=1 GOOS=linux go build -o go_programaCopiaSeguridad .

# Imagen final
FROM alpine:latest

# Instalar dependencias de runtime para Fyne y X11
RUN apk add --no-cache \
    libx11 \
    libxcursor \
    libxrandr \
    libxinerama \
    libxi \
    libglvnd \
    mesa-gl \
    mesa-dri-gallium \
    ca-certificates

WORKDIR /app

# Copiar el binario compilado
COPY --from=builder /app/go_programaCopiaSeguridad .

# Crear directorio de backups por defecto
RUN mkdir -p /backups

# Variables de entorno para X11
ENV DISPLAY=:0

# Comando por defecto
CMD ["./go_programaCopiaSeguridad"]
