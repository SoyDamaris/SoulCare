# SoulCare - Aplicación de Salud Mental

SoulCare es una aplicación web moderna diseñada para promover la salud mental en adolescentes y jóvenes mediante herramientas tecnológicas y educativas.

## 🌟 Características

### 🔐 Autenticación
- Registro e inicio de sesión con email/contraseña
- Autenticación con Google
- Validación de formularios
- Gestión de sesiones seguras

### 📱 Dashboard Personalizado
- **Diario Emocional**: Registro de emociones diarias con emojis, texto y colores
- **Audios de Meditación**: Sesiones de relajación y mindfulness
- **Consejos de Autocuidado**: Tarjetas animadas con tips de bienestar
- **Talleres Virtuales**: Contenido educativo sobre inteligencia emocional
- **Encuestas de Bienestar**: Evaluaciones con resultados visualizados
- **Notificaciones Web**: Recordatorios personalizados
- **Sistema de Logros**: Gamificación con recompensas
- **Panel de Estadísticas**: Gráficos interactivos con Chart.js
- **Modo Oscuro/Claro**: Tema automático adaptable

### 🎨 Diseño
- Interfaz moderna, elegante e intuitiva
- Completamente responsiva (móvil, tablet, desktop)
- Paleta de colores suaves (azul, verde menta, lavanda)
- Animaciones sutiles y transiciones suaves
- Accesibilidad para usuarios con dificultades visuales

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Firebase
  - Authentication
  - Firestore (base de datos)
  - Hosting
  - Cloud Functions
  - Cloud Messaging
- **Gráficos**: Chart.js
- **Notificaciones**: Web Notifications API
- **Almacenamiento**: LocalStorage (desarrollo) / Firestore (producción)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/soulcare.git
cd soulcare
```

### 2. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication con Email/Password y Google
3. Crear una base de datos Firestore
4. Copiar la configuración de Firebase
5. Actualizar `js/config.js` con tus credenciales:

```javascript
const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
};
```

### 3. Configurar reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir solo sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Emociones del usuario
    match /emotions/{emotionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Logros del usuario
    match /achievements/{achievementId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Contenido público (solo lectura)
    match /wellnessTips/{tipId} {
      allow read: if true;
    }
    
    match /workshops/{workshopId} {
      allow read: if true;
    }
  }
}
```

### 4. Ejecutar la aplicación

#### Opción 1: Servidor local simple
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx http-server

# Usando PHP
php -S localhost:8000
```

#### Opción 2: Firebase Hosting (recomendado)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 📁 Estructura del Proyecto

```
soulcare/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos adicionales
├── js/
│   ├── app.js              # Lógica principal de la aplicación
│   └── config.js           # Configuración de Firebase y la app
├── assets/                 # Imágenes, iconos, etc.
├── firebase.json           # Configuración de Firebase Hosting
├── .firebaserc            # Configuración del proyecto Firebase
└── README.md              # Este archivo
```

## 🔧 Configuración Avanzada

### Variables de Entorno
Crear un archivo `.env` (no incluido en el repositorio):
```
FIREBASE_API_KEY=tu-api-key
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_MESSAGING_SENDER_ID=123456789
```

### Configuración de Notificaciones
1. Generar VAPID keys en Firebase Console
2. Actualizar `notificationConfig.vapidKey` en `config.js`
3. Configurar Service Worker para notificaciones push

### Personalización
- **Colores**: Modificar variables CSS en `css/styles.css`
- **Emojis**: Actualizar array de emociones en `app.js`
- **Consejos**: Agregar nuevos tips en la sección correspondiente
- **Talleres**: Expandir contenido educativo

## 📊 Funcionalidades Detalladas

### Diario Emocional
- 12 emociones predefinidas con emojis
- Colores asociados a cada emoción
- Texto libre para reflexiones
- Historial de entradas
- Estadísticas de patrones emocionales

### Sistema de Logros
- Primer registro
- Racha de días consecutivos
- Diversidad emocional
- Participación en talleres
- Completar encuestas

### Estadísticas
- Gráfico de emociones por período
- Actividades completadas
- Tendencias de bienestar
- Comparativas temporales

## 🔒 Privacidad y Seguridad

- Todos los datos se almacenan de forma segura en Firestore
- Autenticación robusta con Firebase Auth
- Reglas de seguridad en Firestore
- Cumplimiento con GDPR
- Datos anónimos para análisis (opcional)

## 🧪 Testing

### Pruebas Manuales
1. Registro de nuevos usuarios
2. Inicio de sesión con diferentes métodos
3. Funcionalidad del diario emocional
4. Responsividad en diferentes dispositivos
5. Notificaciones web
6. Modo oscuro/claro

### Pruebas Automatizadas
```bash
# Instalar dependencias de testing
npm install --save-dev jest puppeteer

# Ejecutar tests
npm test
```

## 🚀 Despliegue

### Firebase Hosting
```bash
firebase deploy --only hosting
```

### Netlify
1. Conectar repositorio GitHub
2. Configurar build settings
3. Desplegar automáticamente

### Vercel
```bash
npm install -g vercel
vercel --prod
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: soporte@soulcare.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/soulcare/issues)
- **Documentación**: [Wiki del proyecto](https://github.com/tu-usuario/soulcare/wiki)

## 🙏 Agradecimientos

- Firebase por la infraestructura backend
- Tailwind CSS por el framework de estilos
- Chart.js por las visualizaciones
- Comunidad de desarrolladores por las librerías open source

## 📈 Roadmap

### Versión 1.1
- [ ] Integración con Spotify para meditaciones
- [ ] Chat con profesionales de salud mental
- [ ] Recordatorios de medicamentos
- [ ] Exportar datos en PDF

### Versión 1.2
- [ ] Aplicación móvil nativa
- [ ] Integración con wearables
- [ ] IA para detección de patrones
- [ ] Comunidad de usuarios

### Versión 2.0
- [ ] Realidad virtual para meditación
- [ ] Análisis de voz para detección emocional
- [ ] Integración con sistemas de salud
- [ ] Certificaciones profesionales

---

**SoulCare** - Cuidando tu bienestar mental, un día a la vez. 💙