# 🔧 Configuración de Dominios Autorizados en Firebase

## ❌ Error Actual
```
Error al iniciar sesión con Google: Firebase: Error (auth/unauthorized-domain)
```

## 🛠️ Solución: Agregar Dominios Autorizados

### 1. Acceder a Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **soulcare-7e377**

### 2. Configurar Authentication
1. En el menú lateral, haz clic en **Authentication**
2. Ve a la pestaña **Sign-in method**
3. En **Google**, haz clic en **Configurar**

### 3. Agregar Dominios Autorizados
En la sección **Authorized domains**, agrega los siguientes dominios:

#### Para Desarrollo Local:
```
localhost
127.0.0.1
file://
```

#### Para GitHub Pages (si planeas usar):
```
souldamaris.github.io
*.github.io
```

#### Para tu dominio personalizado (si tienes):
```
tudominio.com
www.tudominio.com
```

#### Para Firebase Hosting:
```
soulcare-7e377.web.app
soulcare-7e377.firebaseapp.com
```

### 4. Configuración Completa de Dominios
Agrega todos estos dominios en **Authorized domains**:

```
localhost
127.0.0.1
file://
souldamaris.github.io
*.github.io
soulcare-7e377.web.app
soulcare-7e377.firebaseapp.com
```

### 5. Guardar Cambios
1. Haz clic en **Save** para guardar los cambios
2. Espera unos minutos para que los cambios se propaguen

## 🚀 Alternativa Temporal: Usar Firebase Hosting

Si quieres probar inmediatamente, puedes usar Firebase Hosting:

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase
```bash
firebase login
```

### 3. Desplegar a Firebase Hosting
```bash
firebase deploy --only hosting
```

### 4. Acceder a tu aplicación
Tu aplicación estará disponible en:
- `https://soulcare-7e377.web.app`
- `https://soulcare-7e377.firebaseapp.com`

## 🔍 Verificar Configuración

### 1. Verificar Dominios Autorizados
En Firebase Console > Authentication > Sign-in method > Google:
- Debe mostrar todos los dominios que agregaste

### 2. Verificar Configuración de OAuth
En [Google Cloud Console](https://console.cloud.google.com/):
1. Selecciona el proyecto **soulcare-7e377**
2. Ve a **APIs & Services** > **Credentials**
3. Busca tu **OAuth 2.0 Client ID**
4. Verifica que los **Authorized JavaScript origins** incluyan:
   - `http://localhost` (para desarrollo)
   - `https://souldamaris.github.io` (para GitHub Pages)
   - `https://soulcare-7e377.web.app` (para Firebase Hosting)

## 📝 Notas Importantes

1. **Tiempo de Propagación**: Los cambios pueden tardar 5-10 minutos en aplicarse
2. **HTTPS Requerido**: En producción, todos los dominios deben usar HTTPS
3. **Dominios Silvestres**: `*.github.io` permite cualquier subdominio de GitHub Pages
4. **Desarrollo Local**: `localhost` y `127.0.0.1` son necesarios para desarrollo

## 🆘 Si el Error Persiste

### Verificar Configuración de OAuth
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** > **Credentials**
4. Edita tu **OAuth 2.0 Client ID**
5. Agrega los dominios en **Authorized JavaScript origins**

### Limpiar Cache del Navegador
1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Cached images and files"
3. Haz clic en "Clear data"

### Verificar URL Actual
Asegúrate de que estás accediendo desde uno de los dominios autorizados.

## ✅ Resultado Esperado
Después de configurar los dominios, el login con Google debería funcionar correctamente sin errores de dominio no autorizado.
