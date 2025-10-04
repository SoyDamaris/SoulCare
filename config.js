// Firebase Configuration
// Reemplaza estos valores con los de tu proyecto Firebase

const firebaseConfig = {
    apiKey: "AIzaSyCXpdxQuxzS1QTybmcUl295WLK_XsqA0VE",
    authDomain: "soulcare-7e377.firebaseapp.com",
    projectId: "soulcare-7e377",
    storageBucket: "soulcare-7e377.firebasestorage.app",
    messagingSenderId: "184891541651",
    appId: "1:184891541651:web:511228fea3cf53c5b72566",
    measurementId: "G-SHPW0HM39S"
};

// Configuración de Firestore
const firestoreConfig = {
    // Colecciones
    collections: {
        users: 'users',
        emotions: 'emotions',
        achievements: 'achievements',
        wellnessTips: 'wellnessTips',
        workshops: 'workshops',
        surveys: 'surveys'
    },
    
    // Índices para consultas optimizadas
    indexes: {
        emotions: [
            ['userId', 'timestamp'],
            ['userId', 'emotion'],
            ['userId', 'date']
        ],
        achievements: [
            ['userId', 'date'],
            ['userId', 'type']
        ]
    }
};

// Configuración de autenticación
const authConfig = {
    // Proveedores de autenticación habilitados
    providers: {
        email: true,
        google: true,
        // facebook: false,
        // twitter: false
    },
    
    // Configuración de seguridad
    security: {
        minPasswordLength: 6,
        requireEmailVerification: false, // Cambiar a true en producción
        passwordResetEnabled: true
    }
};

// Configuración de notificaciones
const notificationConfig = {
    // Configuración de notificaciones push
    vapidKey: "your-vapid-key",
    
    // Horarios de recordatorios (en formato 24h)
    reminderTimes: [
        { hour: 8, message: "¡Buenos días! ¿Cómo te sientes hoy?" },
        { hour: 14, message: "Tómate un momento para reflexionar sobre tu día" },
        { hour: 20, message: "¿Cómo fue tu día? Registra tus emociones" }
    ],
    
    // Configuración de notificaciones locales
    localNotifications: {
        enabled: true,
        permissionRequired: true
    }
};

// Configuración de la aplicación
const appConfig = {
    // Información de la aplicación
    app: {
        name: "SoulCare",
        version: "1.0.0",
        description: "Aplicación de salud mental para adolescentes y jóvenes"
    },
    
    // Configuración de características
    features: {
        emotionDiary: true,
        meditation: true,
        wellnessTips: true,
        workshops: true,
        surveys: true,
        achievements: true,
        statistics: true,
        darkMode: true,
        notifications: true
    },
    
    // Configuración de privacidad
    privacy: {
        dataRetentionDays: 365,
        anonymizeData: false,
        shareWithResearchers: false
    },
    
    // Configuración de análisis
    analytics: {
        enabled: true,
        trackUserInteractions: true,
        trackEmotionPatterns: true,
        trackFeatureUsage: true
    }
};

// Configuración de desarrollo vs producción
const environment = {
    development: {
        debug: true,
        logLevel: 'debug',
        useLocalStorage: true,
        mockData: true
    },
    
    production: {
        debug: false,
        logLevel: 'error',
        useLocalStorage: false,
        mockData: false
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebaseConfig,
        firestoreConfig,
        authConfig,
        notificationConfig,
        appConfig,
        environment
    };
} else {
    window.SoulCareConfig = {
        firebaseConfig,
        firestoreConfig,
        authConfig,
        notificationConfig,
        appConfig,
        environment
    };
}
