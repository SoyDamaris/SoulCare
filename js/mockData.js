// Datos de ejemplo para desarrollo
const mockData = {
    // Consejos de bienestar
    wellnessTips: [
        {
            id: 'tip-1',
            title: 'Duerme Bien',
            icon: '💤',
            description: 'Mantén un horario de sueño regular. Intenta dormir 7-9 horas cada noche para mantener tu mente y cuerpo saludables.',
            category: 'salud-fisica',
            color: 'pink'
        },
        {
            id: 'tip-2',
            title: 'Ejercítate',
            icon: '🏃‍♀️',
            description: 'El ejercicio libera endorfinas que mejoran tu estado de ánimo. Incluso una caminata de 10 minutos puede hacer la diferencia.',
            category: 'actividad-fisica',
            color: 'blue'
        },
        {
            id: 'tip-3',
            title: 'Aliméntate Bien',
            icon: '🥗',
            description: 'Una dieta balanceada con frutas, verduras y proteínas ayuda a mantener tu energía y estado de ánimo estable.',
            category: 'nutricion',
            color: 'green'
        },
        {
            id: 'tip-4',
            title: 'Desconéctate',
            icon: '📱',
            description: 'Tómate descansos regulares de las redes sociales y pantallas. Tu mente necesita tiempo para descansar.',
            category: 'tecnologia',
            color: 'purple'
        },
        {
            id: 'tip-5',
            title: 'Practica Gratitud',
            icon: '🙏',
            description: 'Cada día, piensa en tres cosas por las que estés agradecido. Esto puede mejorar significativamente tu bienestar.',
            category: 'mindfulness',
            color: 'yellow'
        },
        {
            id: 'tip-6',
            title: 'Conecta con Otros',
            icon: '👥',
            description: 'Mantén relaciones saludables con familia y amigos. El apoyo social es crucial para la salud mental.',
            category: 'relaciones',
            color: 'indigo'
        }
    ],

    // Talleres virtuales
    workshops: [
        {
            id: 'workshop-1',
            title: 'Inteligencia Emocional',
            icon: '🧠',
            description: 'Aprende a identificar, entender y manejar tus emociones de manera saludable.',
            duration: 45,
            level: 'principiante',
            category: 'emociones',
            content: [
                '¿Qué son las emociones?',
                'Identificando tus emociones',
                'Técnicas de regulación emocional',
                'Comunicación emocional efectiva'
            ]
        },
        {
            id: 'workshop-2',
            title: 'Manejo del Estrés',
            icon: '😌',
            description: 'Técnicas prácticas para reducir el estrés y la ansiedad en tu vida diaria.',
            duration: 30,
            level: 'intermedio',
            category: 'estres',
            content: [
                'Identificando fuentes de estrés',
                'Técnicas de respiración',
                'Mindfulness y meditación',
                'Gestión del tiempo'
            ]
        },
        {
            id: 'workshop-3',
            title: 'Autoestima y Confianza',
            icon: '💪',
            description: 'Construye una imagen positiva de ti mismo y desarrolla tu confianza personal.',
            duration: 60,
            level: 'avanzado',
            category: 'autoestima',
            content: [
                'Entendiendo la autoestima',
                'Identificando pensamientos negativos',
                'Técnicas de reframing',
                'Construyendo confianza'
            ]
        },
        {
            id: 'workshop-4',
            title: 'Comunicación Asertiva',
            icon: '🗣️',
            description: 'Aprende a comunicarte de manera clara, respetuosa y efectiva.',
            duration: 40,
            level: 'intermedio',
            category: 'comunicacion',
            content: [
                'Estilos de comunicación',
                'Técnicas de escucha activa',
                'Expresando necesidades',
                'Manejo de conflictos'
            ]
        }
    ],

    // Emociones disponibles
    emotions: [
        { id: 'muy-feliz', emoji: '😄', color: '#10B981', name: 'Muy feliz' },
        { id: 'feliz', emoji: '😊', color: '#34D399', name: 'Feliz' },
        { id: 'neutral', emoji: '😐', color: '#FBBF24', name: 'Neutral' },
        { id: 'triste', emoji: '😢', color: '#F59E0B', name: 'Triste' },
        { id: 'muy-triste', emoji: '😭', color: '#EF4444', name: 'Muy triste' },
        { id: 'ansioso', emoji: '😰', color: '#8B5CF6', name: 'Ansioso' },
        { id: 'enojado', emoji: '😠', color: '#F97316', name: 'Enojado' },
        { id: 'estresado', emoji: '😤', color: '#DC2626', name: 'Estresado' },
        { id: 'relajado', emoji: '😌', color: '#06B6D4', name: 'Relajado' },
        { id: 'motivado', emoji: '💪', color: '#84CC16', name: 'Motivado' },
        { id: 'agotado', emoji: '😴', color: '#6B7280', name: 'Agotado' },
        { id: 'gratitud', emoji: '🙏', color: '#F59E0B', name: 'Con gratitud' }
    ],

    // Logros disponibles
    achievements: [
        {
            id: 'first-entry',
            title: 'Primer Paso',
            description: 'Registraste tu primera emoción',
            icon: '🎉',
            condition: 'emotions_count >= 1',
            points: 10
        },
        {
            id: 'week-streak',
            title: 'Constancia',
            description: 'Has registrado emociones por 7 días',
            icon: '📅',
            condition: 'consecutive_days >= 7',
            points: 50
        },
        {
            id: 'month-streak',
            title: 'Dedicación',
            description: 'Has registrado emociones por 30 días',
            icon: '🏆',
            condition: 'consecutive_days >= 30',
            points: 200
        },
        {
            id: 'emotion-explorer',
            title: 'Explorador Emocional',
            description: 'Has usado 10 emociones diferentes',
            icon: '🌈',
            condition: 'unique_emotions >= 10',
            points: 75
        },
        {
            id: 'workshop-student',
            title: 'Estudiante',
            description: 'Completaste tu primer taller',
            icon: '🎓',
            condition: 'workshops_completed >= 1',
            points: 100
        },
        {
            id: 'mindfulness-master',
            title: 'Maestro del Mindfulness',
            description: 'Completaste 5 sesiones de meditación',
            icon: '🧘',
            condition: 'meditations_completed >= 5',
            points: 150
        }
    ],

    // Encuestas de bienestar
    surveys: [
        {
            id: 'wellness-check',
            title: 'Evaluación de Bienestar',
            description: 'Una breve evaluación de tu estado de bienestar actual',
            questions: [
                {
                    id: 'q1',
                    text: '¿Cómo calificarías tu estado de ánimo general esta semana?',
                    type: 'scale',
                    options: ['Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']
                },
                {
                    id: 'q2',
                    text: '¿Qué tan estresado te has sentido?',
                    type: 'scale',
                    options: ['Nada', 'Poco', 'Moderadamente', 'Mucho', 'Extremadamente']
                },
                {
                    id: 'q3',
                    text: '¿Has dormido bien esta semana?',
                    type: 'scale',
                    options: ['Muy mal', 'Mal', 'Regular', 'Bien', 'Excelente']
                },
                {
                    id: 'q4',
                    text: '¿Has tenido tiempo para actividades que disfrutas?',
                    type: 'yes-no'
                },
                {
                    id: 'q5',
                    text: '¿Te sientes apoyado por las personas cercanas a ti?',
                    type: 'scale',
                    options: ['Nada', 'Poco', 'Moderadamente', 'Mucho', 'Completamente']
                }
            ]
        }
    ],

    // Audios de meditación
    meditations: [
        {
            id: 'meditation-1',
            title: 'Meditación Guiada de 10 minutos',
            description: 'Una meditación guiada para relajarte y encontrar paz interior',
            duration: 600, // 10 minutos en segundos
            type: 'guided',
            audioUrl: '/audio/meditation-10min.mp3'
        },
        {
            id: 'meditation-2',
            title: 'Respiración Profunda',
            description: 'Ejercicio de respiración de 5 minutos para reducir el estrés',
            duration: 300, // 5 minutos
            type: 'breathing',
            audioUrl: '/audio/breathing-5min.mp3'
        },
        {
            id: 'meditation-3',
            title: 'Sonidos de la Naturaleza',
            description: 'Relájate con el sonido del océano y pájaros',
            duration: 1800, // 30 minutos
            type: 'nature',
            audioUrl: '/audio/nature-sounds.mp3'
        }
    ]
};

// Función para obtener datos de ejemplo
function getMockData(type) {
    return mockData[type] || [];
}

// Función para simular datos de usuario
function generateMockUserData() {
    const emotions = [];
    const achievements = [];
    
    // Generar emociones de los últimos 30 días
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const emotionTypes = mockData.emotions;
        const randomEmotion = emotionTypes[Math.floor(Math.random() * emotionTypes.length)];
        
        emotions.push({
            id: `emotion-${i}`,
            emotion: randomEmotion.id,
            color: randomEmotion.color,
            text: `Entrada del día ${i + 1}`,
            date: date.toISOString(),
            timestamp: date.getTime(),
            userId: 'demo-user'
        });
    }
    
    // Generar algunos logros
    achievements.push(
        {
            id: 'first-entry',
            title: 'Primer Paso',
            description: 'Registraste tu primera emoción',
            icon: '🎉',
            date: new Date().toISOString(),
            userId: 'demo-user'
        },
        {
            id: 'week-streak',
            title: 'Constancia',
            description: 'Has registrado emociones por 7 días',
            icon: '📅',
            date: new Date().toISOString(),
            userId: 'demo-user'
        }
    );
    
    return { emotions, achievements };
}

// Exportar para uso en la aplicación
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockData, getMockData, generateMockUserData };
} else {
    window.MockData = { mockData, getMockData, generateMockUserData };
}
