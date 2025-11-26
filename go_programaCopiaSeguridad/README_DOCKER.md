# Ejecutar con Docker

Esta aplicación ahora puede ejecutarse usando Docker. La aplicación tiene una interfaz gráfica (GUI) y requiere acceso a dispositivos USB.

## Requisitos previos

- Docker instalado
- Docker Compose instalado
- Sistema Linux (preferible) o macOS con XQuartz

## Configuración para Linux

### 1. Permitir conexiones X11

Antes de ejecutar el contenedor, permitir que Docker acceda al servidor X11:

```bash
xhost +local:docker
```

### 2. Construir y ejecutar

```bash
docker-compose up --build
```

O ejecutar en segundo plano:

```bash
docker-compose up -d --build
```

### 3. Ver logs

```bash
docker-compose logs -f
```

### 4. Detener la aplicación

```bash
docker-compose down
```

## Configuración para macOS

En macOS, ejecutar aplicaciones GUI desde Docker es más complejo debido a que macOS no usa X11 de forma nativa.

### Opción 1: Usar XQuartz (Recomendado para GUI)

1. Instalar XQuartz:
```bash
brew install --cask xquartz
```

2. Iniciar XQuartz y configurar:
   - Abrir XQuartz
   - Ir a Preferencias > Seguridad
   - Marcar "Permitir conexiones desde clientes de red"

3. Permitir conexiones:
```bash
xhost + 127.0.0.1
```

4. Configurar DISPLAY:
```bash
export DISPLAY=host.docker.internal:0
```

5. Modificar docker-compose.yml para macOS:
```yaml
environment:
  - DISPLAY=host.docker.internal:0
```

6. Ejecutar:
```bash
docker-compose up --build
```

### Opción 2: Compilar y ejecutar nativamente en macOS

Como alternativa, puedes compilar la aplicación directamente en macOS sin Docker:

```bash
go build -o go_programaCopiaSeguridad .
./go_programaCopiaSeguridad
```

## Estructura de directorios

- `./backups` - Los backups se guardarán aquí
- `/dev` - Acceso a dispositivos USB (Linux)
- `/Volumes` - Acceso a dispositivos USB (macOS, descomentar en docker-compose.yml)

## Notas importantes

### Acceso a USB

- **Linux**: El contenedor tiene acceso privilegiado a `/dev` para detectar dispositivos USB
- **macOS**: Docker Desktop no soporta acceso directo a USB. Se recomienda ejecutar nativamente

### Seguridad

El contenedor requiere:
- Modo privilegiado (`privileged: true`)
- Acceso a `/dev`
- Acceso al socket X11

Esto es necesario para la detección de USB y la GUI, pero tiene implicaciones de seguridad. Usa solo en entornos de desarrollo o controlados.

### Variables de entorno

Puedes personalizar:

```bash
# Cambiar el DISPLAY
DISPLAY=:1 docker-compose up

# O crear un archivo .env
echo "DISPLAY=:1" > .env
docker-compose up
```

## Solución de problemas

### La GUI no aparece

1. Verificar que X11 esté corriendo:
```bash
echo $DISPLAY
```

2. Verificar permisos X11:
```bash
xhost +local:docker
```

3. Ver logs del contenedor:
```bash
docker-compose logs -f
```

### No detecta dispositivos USB

1. Verificar que el dispositivo esté montado:
```bash
lsusb
ls /dev/disk/by-id/
```

2. Verificar permisos del contenedor (debe ser privilegiado)

3. En macOS, considera ejecutar la aplicación nativamente

### Error de compilación

Si hay problemas con la versión de Go:

```dockerfile
# En Dockerfile, cambiar la línea:
FROM golang:1.23-alpine AS builder
```

## Comandos útiles

```bash
# Reconstruir sin cache
docker-compose build --no-cache

# Ver contenedores en ejecución
docker-compose ps

# Entrar al contenedor
docker-compose exec usb-backup-client /bin/sh

# Ver uso de recursos
docker stats usb-backup-client

# Limpiar todo
docker-compose down -v
docker system prune -a
```

## Recomendación

Para macOS, debido a las limitaciones de Docker Desktop con GUI y USB, se recomienda **ejecutar la aplicación nativamente** en lugar de usar Docker.

Para Linux, Docker funciona bien con las configuraciones proporcionadas.
