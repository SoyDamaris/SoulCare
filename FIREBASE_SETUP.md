# Configuración de Firebase Authentication

Para que SoulCare funcione correctamente con Firebase, necesitas configurar Authentication en tu proyecto Firebase.

## 🔧 Pasos para configurar Firebase Authentication

### 1. Ir a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `soulcare-7e377`

### 2. Habilitar Authentication
1. En el menú lateral, haz clic en **Authentication**
2. Haz clic en **Get started**
3. Ve a la pestaña **Sign-in method**

### 3. Configurar Email/Password
1. Haz clic en **Email/Password**
2. Habilita **Email/Password** (primer toggle)
3. Opcionalmente, habilita **Email link (passwordless sign-in)**
4. Haz clic en **Save**

### 4. Configurar Google Sign-in
1. Haz clic en **Google**
2. Habilita el toggle
3. Selecciona un **Project support email**
4. Haz clic en **Save**

### 5. Configurar dominios autorizados
1. En la pestaña **Settings** de Authentication
2. En **Authorized domains**, asegúrate de tener:
   - `localhost` (para desarrollo)
   - `soulcare-7e377.firebaseapp.com` (para producción)
   - Tu dominio personalizado si tienes uno

## 🔒 Configuración de Firestore

### 1. Crear base de datos Firestore
1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **Create database**
3. Selecciona **Start in test mode** (por ahora)
4. Elige una ubicación cercana a tus usuarios

### 2. Configurar reglas de seguridad
Las reglas ya están configuradas en `firestore.rules`, pero necesitas desplegarlas:

```bash
firebase deploy --only firestore:rules
```

## 🚀 Desplegar la aplicación

### Opción 1: Firebase Hosting (Recomendado)
```bash
# Instalar Firebase CLI si no lo tienes
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Desplegar
firebase deploy
```

### Opción 2: Servidor local para pruebas
```bash
# El servidor ya está corriendo en http://localhost:8000
# Solo necesitas abrir tu navegador y ir a esa URL
```

## 🧪 Probar la funcionalidad

### 1. Registro de usuario
1. Abre la aplicación en tu navegador
2. Haz clic en "Regístrate aquí"
3. Completa el formulario con:
   - Nombre
   - Email válido
   - Contraseña (mínimo 6 caracteres)
4. Haz clic en "Crear Cuenta"

### 2. Inicio de sesión
1. Usa las credenciales que acabas de crear
2. O prueba con Google Sign-in

### 3. Verificar datos en Firebase
1. Ve a Firebase Console → Authentication
2. Deberías ver tu usuario registrado
3. Ve a Firestore Database
4. Deberías ver una colección `users` con tu información

## 🔍 Solución de problemas

### Error: "auth/api-key-not-valid"
- Verifica que las credenciales en `index.html` sean correctas
- Asegúrate de que el proyecto Firebase esté activo

### Error: "auth/domain-not-authorized"
- Agrega `localhost` a los dominios autorizados en Firebase Console
- Ve a Authentication → Settings → Authorized domains

### Error: "permission-denied" en Firestore
- Verifica que las reglas de Firestore estén desplegadas
- Asegúrate de que el usuario esté autenticado

### No se guardan los datos
- Verifica la consola del navegador para errores
- Asegúrate de que Firestore esté habilitado
- Verifica que las reglas de seguridad permitan escritura

## 📱 Configuración adicional

### Notificaciones push (opcional)
1. Ve a Project Settings → Cloud Messaging
2. Genera un par de claves VAPID
3. Actualiza `notificationConfig.vapidKey` en `js/config.js`

### Analytics (opcional)
1. Ve a Analytics en Firebase Console
2. Sigue las instrucciones para habilitar Google Analytics
3. El measurementId ya está configurado

## ✅ Verificación final

Una vez configurado todo, deberías poder:
- ✅ Registrarte con email/contraseña
- ✅ Iniciar sesión con Google
- ✅ Ver tu información en Firestore
- ✅ Guardar emociones en la base de datos
- ✅ Mantener la sesión activa

¡Tu aplicación SoulCare está lista para usar! 🎉
