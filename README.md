# 🌸 CicloApp - Aplicación de Control del Ciclo Menstrual

Una aplicación moderna y completa para el seguimiento del ciclo menstrual femenino, desarrollada con React y Firebase.

## ✨ Características

### 🏠 Dashboard Principal
- **Mapa del Ciclo**: Visualización gráfica interactiva del ciclo menstrual
- **Resumen del Día**: Información personalizada sobre el día actual
- **Predicciones**: Estimación del próximo período y fase fértil
- **Registro de Síntomas**: Seguimiento de síntomas físicos y emocionales
- **Insights Personalizados**: Estadísticas y recomendaciones basadas en tu historial

### 📅 Calendario Inteligente
- Calendario visual con codificación por colores para cada fase
- Registro de eventos y notas diarias
- Historial completo de períodos y síntomas
- Leyenda interactiva de fases del ciclo

### 📊 Seguimiento Detallado
- Registro de períodos con flujo y duración
- Tracking de síntomas físicos (dolor, fatiga, etc.)
- Monitoreo del estado de ánimo
- Estadísticas y tendencias a largo plazo

### 👥 Funciones Sociales
- **Chat en Tiempo Real**: Comunicación con amigas y pareja
- **Compartir Ciclo**: Comparte información seleccionada con personas de confianza
- **Notas Compartidas**: Crea y comparte notas con tags y estados de ánimo
- **Sistema de Amistad**: Agrega amigas y gestiona conexiones
- **Usuarios en Línea**: Ve quién está activo en tiempo real

### 🔐 Privacidad y Seguridad
- Control granular de qué información compartir
- Configuración de privacidad personalizable
- Encriptación de datos sensibles
- Autenticación segura con Firebase Auth

### 📱 Experiencia Móvil
- Diseño completamente responsivo
- Navegación optimizada para móviles
- Interfaz táctil intuitiva

## 🚀 Tecnologías Utilizadas

- **Frontend**: React 18, React Router DOM
- **Estilos**: Tailwind CSS
- **Base de Datos**: Firebase Realtime Database
- **Autenticación**: Firebase Auth (Email/Password + Google)
- **Iconos**: Lucide React
- **Notificaciones**: React Hot Toast
- **SEO**: React Helmet Async

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Firebase

### 1. Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd app-control-ciclo
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Authentication y Realtime Database
4. Configura los métodos de autenticación (Email/Password y Google)
5. Copia la configuración de Firebase

### 4. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_FIREBASE_API_KEY=tu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://tu_proyecto-default-rtdb.firebaseio.com/
REACT_APP_FIREBASE_PROJECT_ID=tu_proyecto
REACT_APP_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 5. Configurar reglas de Firebase

#### Realtime Database Rules:
```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "cycles": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "friendships": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "chats": {
      "$chatId": {
        ".read": "auth != null && (root.child('chats').child($chatId).child('participants').child(auth.uid).exists())",
        ".write": "auth != null && (root.child('chats').child($chatId).child('participants').child(auth.uid).exists())"
      }
    },
    "shared_notes": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### 6. Ejecutar la aplicación
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📋 Scripts Disponibles

- `npm start`: Ejecuta la aplicación en modo desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm test`: Ejecuta las pruebas
- `npm run eject`: Expone la configuración de Create React App

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Auth/              # Componentes de autenticación
│   ├── Dashboard/         # Dashboard principal
│   ├── Calendar/          # Calendario
│   ├── Tracking/          # Seguimiento
│   ├── Social/            # Funciones sociales
│   ├── Chat/              # Sistema de chat
│   ├── Sharing/           # Compartir ciclo y notas
│   ├── Onboarding/        # Proceso de bienvenida
│   ├── Profile/           # Perfil de usuario
│   ├── Settings/          # Configuración
│   ├── Layout/            # Layout y navegación
│   └── Modals/            # Modales
├── contexts/
│   ├── AuthContext.js     # Contexto de autenticación
│   ├── CycleContext.js    # Contexto del ciclo menstrual
│   └── SocialContext.js   # Contexto social
├── config/
│   └── firebase.js        # Configuración de Firebase
├── App.js                 # Componente principal
├── index.js              # Punto de entrada
└── index.css             # Estilos globales
```

## 🔧 Configuración Adicional

### Personalización de Tailwind CSS
El archivo `tailwind.config.js` incluye configuraciones personalizadas para:
- Colores de marca (rosa y púrpura)
- Animaciones personalizadas
- Utilidades adicionales

### PostCSS
El archivo `postcss.config.js` está configurado para procesar Tailwind CSS correctamente.

## 🚦 Uso de la Aplicación

### 1. Registro e Inicio de Sesión
- Crea una cuenta con email y contraseña o usa Google
- Completa el proceso de onboarding

### 2. Configuración Inicial
- Ingresa la fecha de tu último período
- Configura la duración de tu ciclo
- Selecciona tus objetivos y preferencias

### 3. Uso Diario
- Registra síntomas y estado de ánimo
- Consulta predicciones y estadísticas
- Interactúa con amigas en el chat
- Comparte información seleccionada con tu pareja

### 4. Funciones Sociales
- Agrega amigas por correo electrónico
- Crea y comparte notas
- Chatea en tiempo real
- Configura qué información compartir

## 🔐 Consideraciones de Privacidad

- Todos los datos se almacenan de forma segura en Firebase
- Control granular sobre qué información compartir
- Opciones de configuración de privacidad flexibles
- Posibilidad de revocar accesos en cualquier momento

## 🐛 Solución de Problemas

### Error de Tailwind CSS
Si ves errores relacionados con `@apply`, asegúrate de:
1. Tener PostCSS configurado correctamente
2. Ejecutar `npm run build` para procesar los estilos

### Problemas de Firebase
1. Verifica que las variables de entorno estén configuradas
2. Revisa las reglas de seguridad de Firebase
3. Asegúrate de haber habilitado los servicios necesarios

## 📈 Próximas Funcionalidades

- [ ] Notificaciones push
- [ ] Exportación de datos
- [ ] Integración con dispositivos wearables
- [ ] Modo offline
- [ ] Múltiples idiomas
- [ ] Análisis avanzados con IA

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Haz fork del proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 💬 Soporte

Si tienes preguntas o necesitas ayuda:
- Abre un issue en GitHub
- Consulta la documentación de Firebase
- Revisa la documentación de React

---

**Desarrollado con ❤️ para empoderar a las mujeres en el cuidado de su salud**
