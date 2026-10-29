# unPicadito Mobile ⚽📱

Aplicación móvil oficial de **unPicadito**, desarrollada con **React Native** y **Expo (SDK 57)** con enrutamiento declarativo vía **Expo Router**.

---

## 🚀 Tecnologías Principales
- **Framework:** [Expo](https://expo.dev/) (SDK 57) + [React Native](https://reactnative.dev/) (0.86.3) con New Architecture.
- **Enrutamiento:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing con grupos de rutas `(auth)`, `(app)`, `(tabs)` y dinámicas `[id]`).
- **Estado Global:** [Zustand](https://github.com/pmndrs/zustand) para autenticación y persistencia de sesión.
- **Validación de Formularios:** [Yup](https://github.com/jquense/yup) con validaciones en dos capas (cliente y servidor).
- **Mapas y Geolocalización:** [Leaflet](https://leafletjs.com/) sobre `react-native-webview` con baldosas de OpenStreetMap (cero costos y sin requerimiento de API keys).
- **Cliente HTTP:** [Axios](https://axios-http.com/) con interceptores de autorización JWT y auto-logout en 401.
- **Íconos:** `lucide-react-native`.

---

## 📁 Estructura del Proyecto

```text
mobile.unPicadito/
├── src/
│   ├── api/                   # Cliente Axios configurado con interceptores
│   ├── app/                   # Árbol de navegación y pantallas (Expo Router)
│   │   ├── (auth)/            # Login y Registro
│   │   ├── (app)/             # Rutas protegidas
│   │   │   ├── (tabs)/        # Feed, Crear Partido, Mis Partidos, Jugadores, Perfil
│   │   │   ├── salas/         # Detalle y edición de partidos ([id], [id]/editar)
│   │   │   └── usuarios/      # Perfiles de otros jugadores
│   │   └── _layout.tsx        # Layout raíz
│   ├── components/            # Componentes UI transversales reutilizables
│   │   ├── feedback/          # LoadingSpinner, ErrorMessage, EmptyState
│   │   ├── layout/            # ScreenContainer
│   │   └── ui/                # Button, Input, Badge, LocationPickerMap, SectionCard...
│   ├── config/                # Variables de entorno y Tokens de diseño (THEME)
│   ├── constants/             # Constantes globales (partidos, localidades)
│   ├── features/              # Módulos de dominio funcional (Feature-Based)
│   │   ├── auth/              # useAuthStore, esquemas y servicios de auth
│   │   ├── friends/           # Amistades y solicitudes
│   │   ├── matches/           # Feed, filtros, tableros tácticos, creación con predios
│   │   ├── players/           # Búsqueda de jugadores y perfiles
│   │   └── profile/           # Perfil propio, edición y calificaciones
│   └── hooks/                 # Custom hooks (useDebounce, etc.)
└── package.json
```

---

## ⚙️ Configuración y Comandos

### Instalación de dependencias
```bash
npm install
```

### Iniciar servidor de desarrollo (Expo CLI)
```bash
npx expo start
```
- Presiona `a` para abrir en emulador **Android**.
- Presiona `i` para abrir en simulador **iOS**.
- Presiona `w` para abrir en navegador **Web**.
- O escanea el código QR desde la app **Expo Go** en tu dispositivo físico (ambos conectados a la misma red Wi-Fi).

### Verificación de TypeScript
```bash
npx tsc --noEmit
```

---

## 🎯 Integración con el Backend (`api.unPicadito`)
- **Creación de Partidos:** Flujo asistido **Predio ➔ Cancha** (`GET /api/predios/cercanos` y `GET /api/predios/:id/canchas`) enviando `canchaId` y validando horas en punto (`:00`).
- **Filtros Espaciales:** Filtrado por localidades de Misiones (Posadas, Oberá, Garupá, etc.) y radio en kilómetros (`5`, `10`, `20`, `50 km`) consumiendo `ST_Distance_Sphere` en la base de datos MariaDB.
- **Ciclo de Partidos:** Unirse, darse de baja, expulsar jugadores (organizador), cancelar sala con motivo y **finalizar partido** (habilitado tras 30 minutos del inicio).
