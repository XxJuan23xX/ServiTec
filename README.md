# 🔧 ServiTec - PWA de Reportes de Servicio Técnico

Aplicación Progressive Web App (PWA) diseñada para técnicos en campo que trabajan en zonas rurales sin acceso a internet. Permite capturar reportes de servicio técnico offline y sincronizarlos automáticamente cuando se recupera la conexión.

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + Vite 8 |
| **Estilos** | Tailwind CSS v4 |
| **Backend** | Node.js + Express |
| **PWA** | Service Worker + Web App Manifest |
| **Almacenamiento Offline** | localStorage |

## 📁 Estructura del Proyecto

```
Web10D/
├── public/
│   ├── icons/              # Iconos PWA (72x72 a 512x512)
│   ├── favicon.svg         # Favicon SVG
│   ├── manifest.json       # Web App Manifest
│   └── sw.js               # Service Worker
├── src/
│   ├── components/
│   │   ├── Header.jsx      # Barra superior con logo y sync
│   │   ├── NetworkBanner.jsx # Banner de estado de red
│   │   ├── ReporteForm.jsx # Formulario de captura de reportes
│   │   └── ReportesList.jsx # Lista de reportes guardados
│   ├── utils/
│   │   ├── networkStatus.js # Hook para detectar estado de red
│   │   ├── storage.js       # CRUD de reportes en localStorage
│   │   └── syncService.js   # Servicio de sincronización con API
│   ├── App.jsx             # Componente principal
│   ├── index.css           # Estilos (Tailwind CSS)
│   └── main.jsx            # Entry point + registro de SW
├── server/
│   ├── server.js           # API REST con Express
│   ├── package.json        # Dependencias del backend
│   └── data/               # Datos persistidos (JSON)
├── scripts/
│   └── generate-icons.mjs  # Generador de iconos PWA
├── index.html              # HTML principal con meta tags PWA
├── vite.config.js          # Config de Vite + Tailwind
└── package.json            # Dependencias del frontend
```

## 🚀 Cómo Ejecutar

### 1. Instalar dependencias

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Iniciar el Backend (Terminal 1)

```bash
cd server
npm run dev
```

El servidor arranca en `http://localhost:3001`

### 3. Iniciar el Frontend (Terminal 2)

```bash
npm run dev
```

La app arranca en `http://localhost:5173`

## ✨ Funcionalidades (Fase 1 y 2)

### ✅ Fase 1 - Configuración PWA
- [x] Web App Manifest (`manifest.json`) con iconos y metadata
- [x] Service Worker con estrategia **Stale-While-Revalidate**
- [x] Registro automático del Service Worker en el entry point
- [x] Meta tags para PWA en `index.html` (theme-color, apple-web-app, etc.)
- [x] Iconos PWA en múltiples resoluciones

### ✅ Fase 2 - Formulario Offline
- [x] Formulario de captura de reportes con campos: técnico, cliente, dirección, tipo de servicio, prioridad, equipo, descripción, observaciones
- [x] Validación de campos requeridos
- [x] Guardado en `localStorage` cuando no hay red
- [x] Detección de estado de red en tiempo real (`navigator.onLine`)
- [x] Banner visual de estado de conexión (Online/Offline/Syncing)
- [x] Lista de reportes con estado de sincronización
- [x] Sincronización automática al recuperar conexión
- [x] API REST básica (Express) para recepción de reportes

## 📱 Probar Modo Offline

1. Abre la app en Chrome
2. Ve a **DevTools → Application → Service Workers** para verificar el registro
3. En **DevTools → Network**, activa el modo **Offline**
4. Crea un reporte — se guardará localmente
5. Desactiva el modo Offline — el reporte se sincronizará automáticamente

## 🎨 Diseño

- Tema oscuro optimizado para uso en campo (bajo brillo)
- Diseño mobile-first pensado para smartphones
- Indicadores visuales de prioridad (Baja/Media/Alta)
- Feedback visual de estado de red y sincronización
- Tipografía Inter de Google Fonts
