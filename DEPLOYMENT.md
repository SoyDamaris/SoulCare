# Guía de Despliegue - SoulCare

Esta guía te ayudará a desplegar SoulCare en diferentes plataformas.

## 🚀 Despliegue en Firebase Hosting (Recomendado)

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase
```bash
firebase login
```

### 3. Inicializar el proyecto
```bash
firebase init
```

Selecciona:
- ✅ Hosting
- ✅ Firestore
- ✅ Functions (opcional)

### 4. Configurar el proyecto
- Selecciona tu proyecto Firebase existente
- Directorio público: `.` (directorio actual)
- Configurar como SPA: `Yes`
- Sobrescribir index.html: `No`

### 5. Desplegar
```bash
firebase deploy
```

### 6. Configurar dominio personalizado (opcional)
```bash
firebase hosting:channel:deploy production
```

## 🌐 Despliegue en Netlify

### Opción 1: Desde GitHub
1. Conecta tu repositorio GitHub a Netlify
2. Configuración de build:
   - Build command: `(vacío)`
   - Publish directory: `.`
3. Despliega automáticamente

### Opción 2: Arrastrar y soltar
1. Ve a [netlify.com](https://netlify.com)
2. Arrastra la carpeta del proyecto
3. Configura variables de entorno si es necesario

### Opción 3: CLI de Netlify
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir .
```

## ⚡ Despliegue en Vercel

### Opción 1: Desde GitHub
1. Conecta tu repositorio a Vercel
2. Configuración automática detectada
3. Despliega

### Opción 2: CLI de Vercel
```bash
npm install -g vercel
vercel --prod
```

## 🐳 Despliegue con Docker

### 1. Crear Dockerfile
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Construir imagen
```bash
docker build -t soulcare .
```

### 3. Ejecutar contenedor
```bash
docker run -p 80:80 soulcare
```

## 🔧 Configuración de Variables de Entorno

### Firebase Hosting
Crear archivo `.env.production`:
```
FIREBASE_API_KEY=tu-api-key
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_MESSAGING_SENDER_ID=123456789
```

### Netlify
En el dashboard de Netlify:
- Site settings → Environment variables
- Agregar variables necesarias

### Vercel
En el dashboard de Vercel:
- Project settings → Environment Variables
- Agregar variables para producción

## 📱 Configuración PWA (Progressive Web App)

### 1. Crear manifest.json
```json
{
  "name": "SoulCare",
  "short_name": "SoulCare",
  "description": "Aplicación de salud mental",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3B82F6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. Crear service worker
```javascript
// sw.js
const CACHE_NAME = 'soulcare-v1';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/js/config.js',
  '/js/mockData.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
```

### 3. Registrar service worker en app.js
```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 🔒 Configuración de Seguridad

### Headers de Seguridad
Agregar a `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains"
          }
        ]
      }
    ]
  }
}
```

### HTTPS
- Firebase Hosting: ✅ Automático
- Netlify: ✅ Automático
- Vercel: ✅ Automático

## 📊 Monitoreo y Analytics

### Google Analytics
```javascript
// Agregar a index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Firebase Analytics
```javascript
// En app.js
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

## 🧪 Testing en Producción

### 1. Verificar funcionalidades
- [ ] Autenticación funciona
- [ ] Datos se guardan correctamente
- [ ] Notificaciones funcionan
- [ ] Responsive design
- [ ] Performance

### 2. Herramientas de testing
```bash
# Lighthouse para performance
npm install -g lighthouse
lighthouse https://tu-dominio.com

# WebPageTest
# Visitar https://webpagetest.org
```

## 🔄 CI/CD Pipeline

### GitHub Actions
Crear `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install -g firebase-tools
      - run: firebase deploy --token ${{ secrets.FIREBASE_TOKEN }}
```

## 📈 Optimizaciones de Performance

### 1. Compresión
- Gzip/Brotli automático en Firebase Hosting
- Minificar CSS y JS

### 2. Caching
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 3. Lazy Loading
```javascript
// Cargar Chart.js solo cuando se necesite
const loadChart = async () => {
  const { Chart } = await import('chart.js');
  return Chart;
};
```

## 🚨 Troubleshooting

### Problemas comunes:

1. **Firebase no se inicializa**
   - Verificar configuración en `config.js`
   - Revisar reglas de Firestore

2. **Notificaciones no funcionan**
   - Verificar permisos del navegador
   - Revisar VAPID keys

3. **Estilos no se cargan**
   - Verificar rutas de archivos CSS
   - Revisar configuración de hosting

4. **Datos no se guardan**
   - Verificar reglas de Firestore
   - Revisar autenticación

### Logs y debugging:
```javascript
// Habilitar logs detallados
localStorage.setItem('debug', 'true');
```

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisar logs en la consola del navegador
2. Verificar configuración de Firebase
3. Consultar documentación de la plataforma
4. Crear issue en GitHub

---

¡Tu aplicación SoulCare está lista para ayudar a los usuarios a cuidar su salud mental! 💙
