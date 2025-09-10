# Grid de Imágenes

Una aplicación web responsiva que muestra un grid configurable de imágenes usando Bootstrap 5.

## 🚀 Características

- **Grid configurable**: Elige entre 6x6, 8x8 o 16x16 imágenes
- **Diseño responsivo**: Se adapta a diferentes tamaños de pantalla
- **Configuración visual**: Modal con opciones para bordes y aspecto cuadrado
- **Bootstrap 5**: Interfaz moderna y profesional
- **Carga lazy**: Las imágenes se cargan de forma eficiente

## 📁 Estructura del proyecto

```
grid/
├── index.html          # Archivo principal
├── assets/
│   ├── css/
│   │   └── style.css   # Estilos personalizados
│   └── js/
│       └── main.js     # Lógica de la aplicación
├── imagenes/           # Carpeta para tus imágenes
└── README.md          # Este archivo
```

## 🖼️ Agregar imágenes

1. Coloca tus imágenes en la carpeta `imagenes/`
2. Los formatos soportados son: JPG, PNG, GIF, WebP
3. Se recomienda usar imágenes cuadradas (ej: 300x300px)

**Nombres sugeridos**: `imagen1.jpg`, `imagen2.png`, etc.

## 🌐 Cómo usar

### Opción 1: Servidor local con Python

```bash
# Navegar a la carpeta grid
cd grid

# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Luego abrir: http://localhost:8000

### Opción 2: Servidor local con Node.js

```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar en la carpeta grid
cd grid
http-server

# O en un solo comando
npx http-server grid
```

### Opción 3: Live Server (VS Code)

1. Instalar la extensión "Live Server"
2. Hacer clic derecho en `index.html`
3. Seleccionar "Open with Live Server"

## ⚙️ Configuraciones disponibles

- **Tamaño del grid**: 6x6, 8x8, 16x16
- **Bordes**: Mostrar/ocultar bordes en las imágenes
- **Aspecto**: Mantener aspecto cuadrado o natural

## 🛠️ Personalización

### Cambiar colores

Edita las variables CSS en `assets/css/style.css`:

```css
:root {
  --grid-gap: 8px;
  --primary-color: #0d6efd;
  --border-color: #adb5bd;
}
```

### Modificar tamaños de grid

En `assets/js/main.js`, busca el método `generatePlaceholderImages()` y ajusta el número de imágenes según necesites.

## 📱 Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles

## 🔧 Solución de problemas

**Las imágenes no cargan:**
- Verifica que estés usando un servidor web local
- Asegúrate de que las imágenes estén en `imagenes/`
- Verifica los permisos de los archivos

**El grid no se muestra:**
- Abre las herramientas de desarrollador (F12)
- Revisa la consola por errores
- Verifica que todos los archivos CSS y JS se carguen correctamente

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y personales.
