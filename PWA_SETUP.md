# Configuración de Íconos para PWA

Para que la aplicación se instale correctamente, necesitas crear íconos en los siguientes tamaños:

## Íconos Requeridos

Coloca estos archivos en el directorio `public/`:

1. **icon-192.png** - 192x192 píxeles
2. **icon-512.png** - 512x512 píxeles

## Cómo Crearlos

Puedes usar tu logo actual (`logo.png`) y redimensionarlo a estos tamaños:

### Opción 1: Usando ImageMagick (Linux/Mac)
```bash
# Desde el directorio public/
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png
```

### Opción 2: Online
- Sube tu logo a https://realfavicongenerator.net/
- Descarga los íconos generados

### Opción 3: Photoshop/GIMP
- Abre `logo.png`
- Redimensiona a 192x192 y exporta como `icon-192.png`
- Redimensiona a 512x512 y exporta como `icon-512.png`

## Actualizar Manifest

Una vez creados los íconos, actualiza `public/manifest.json`:

```json
"icons": [
  {
    "src": "/icon-192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icon-512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

## Probar la PWA

1. Abre la aplicación en Chrome/Edge
2. Abre DevTools (F12) → Application → Manifest
3. Verifica que no haya errores
4. Busca el ícono de instalación en la barra de direcciones
5. Haz clic en "Instalar"

La aplicación se instalará como una app nativa en tu computador/móvil.
