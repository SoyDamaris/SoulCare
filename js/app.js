// SoulCare - Aplicación de Salud Mental
// JavaScript principal para la funcionalidad de la aplicación

class SoulCareApp {
    constructor() {
        this.currentUser = null;
        this.emotions = [];
        this.achievements = [];
        this.isDarkMode = false;
        this.selectedEmotion = null;
        
        this.init();
    }

    async init() {
        // Mostrar pantalla de carga
        this.showLoadingScreen();
        
        // Inicializar Firebase Auth
        await this.initFirebase();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Verificar autenticación
        this.checkAuthState();
        
        // Ocultar pantalla de carga después de 2 segundos
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 2000);
    }

    showLoadingScreen() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    hideLoadingScreen() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    async initFirebase() {
        try {
            // Esperar a que Firebase esté disponible
            await this.waitForFirebase();
            console.log('Firebase inicializado correctamente');
        } catch (error) {
            console.error('Error inicializando Firebase:', error);
        }
    }

    async waitForFirebase() {
        return new Promise((resolve) => {
            const checkFirebase = () => {
                if (window.auth && window.firebaseAuth) {
                    resolve();
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            checkFirebase();
        });
    }

    setupEventListeners() {
        // Autenticación
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('showRegister').addEventListener('click', () => this.showRegisterForm());
        document.getElementById('showLogin').addEventListener('click', () => this.showLoginForm());
        document.getElementById('googleLogin').addEventListener('click', () => this.handleGoogleLogin());
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());

        // Navegación del dashboard
        document.getElementById('emotion-diary-btn').addEventListener('click', () => this.showSection('emotion-diary-section'));
        document.getElementById('meditation-btn').addEventListener('click', () => this.showSection('meditation-section'));
        document.getElementById('tips-btn').addEventListener('click', () => this.showSection('tips-section'));
        document.getElementById('workshops-btn').addEventListener('click', () => this.showSection('workshops-section'));

        // Estadísticas
        document.getElementById('statistics-btn').addEventListener('click', () => this.showSection('statistics-section'));

        // Diario emocional
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectEmotion(e));
        });
        document.getElementById('save-emotion').addEventListener('click', () => this.saveEmotion());

        // Botones de meditación
        this.setupMeditationButtons();

        // Botones de talleres
        this.setupWorkshopButtons();

        // Tema oscuro/claro
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());

        // Notificaciones
        document.getElementById('notifications-btn').addEventListener('click', () => this.showNotifications());

        // Menú de usuario
        this.setupUserMenu();

        // Actualizar tiempo en tiempo real
        this.updateCurrentTime();
        setInterval(() => this.updateCurrentTime(), 1000);

        // Cargar datos al iniciar
        this.loadUserData();
    }

    checkAuthState() {
        if (window.auth && window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged(window.auth, (user) => {
                if (user) {
                    this.currentUser = user;
                    this.showMainApp();
                    this.updateUserInfo();
                    this.saveUserToFirestore(user);
                } else {
                    this.showAuthScreen();
                }
            });
        } else {
            // Simular usuario logueado para desarrollo
            this.simulateUser();
        }
    }

    async saveUserToFirestore(user) {
        try {
            if (window.db && window.firebaseFirestore) {
                const userRef = window.firebaseFirestore.doc(window.db, 'users', user.uid);
                const userSnap = await window.firebaseFirestore.getDoc(userRef);
                
                if (!userSnap.exists()) {
                    await window.firebaseFirestore.setDoc(userRef, {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || 'Usuario',
                        createdAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString(),
                        preferences: {
                            theme: 'light',
                            notifications: true
                        }
                    });
                    console.log('Usuario guardado en Firestore');
                } else {
                    // Actualizar último login
                    await window.firebaseFirestore.setDoc(userRef, {
                        lastLogin: new Date().toISOString()
                    }, { merge: true });
                }
            }
        } catch (error) {
            console.error('Error guardando usuario en Firestore:', error);
        }
    }

    simulateUser() {
        this.currentUser = {
            uid: 'demo-user',
            displayName: 'Usuario Demo',
            email: 'demo@soulcare.com'
        };
        this.showMainApp();
        this.updateUserInfo();
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            if (window.auth && window.firebaseAuth) {
                await window.firebaseAuth.signInWithEmailAndPassword(window.auth, email, password);
                this.showSuccess('¡Inicio de sesión exitoso!');
            } else {
                // Simular login exitoso
                this.simulateUser();
            }
        } catch (error) {
            this.showError('Error al iniciar sesión: ' + error.message);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showError('Las contraseñas no coinciden');
            return;
        }

        try {
            if (window.auth && window.firebaseAuth) {
                const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(window.auth, email, password);
                await window.firebaseAuth.updateProfile(userCredential.user, { displayName: name });
                this.showSuccess('¡Cuenta creada exitosamente!');
            } else {
                // Simular registro exitoso
                this.simulateUser();
            }
        } catch (error) {
            this.showError('Error al crear cuenta: ' + error.message);
        }
    }

    async handleGoogleLogin() {
        try {
            if (window.auth && window.firebaseAuth) {
                const provider = new window.firebaseAuth.GoogleAuthProvider();
                const result = await window.firebaseAuth.signInWithPopup(window.auth, provider);
                this.currentUser = result.user;
                
                // Guardar datos del usuario en Firestore
                await this.saveUserData(result.user);
                
                this.showSuccess('¡Inicio de sesión con Google exitoso!');
                this.showDashboard();
            } else {
                // Simular login con Google
                this.simulateUser();
            }
        } catch (error) {
            console.error('Error al iniciar sesión con Google:', error);
            
            // Manejar errores específicos
            if (error.code === 'auth/unauthorized-domain') {
                this.showDomainError();
            } else if (error.code === 'auth/popup-closed-by-user') {
                this.showError('Inicio de sesión cancelado por el usuario');
            } else if (error.code === 'auth/popup-blocked') {
                this.showError('Popup bloqueado por el navegador. Permite popups para este sitio.');
            } else {
                this.showError('Error al iniciar sesión con Google: ' + error.message);
            }
        }
    }

    showDomainError() {
        const errorModal = document.createElement('div');
        errorModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        errorModal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl">
                <div class="text-center">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">Dominio No Autorizado</h3>
                    <p class="text-gray-600 mb-6">
                        El dominio actual no está autorizado en Firebase. Para solucionarlo:
                    </p>
                    
                    <div class="bg-blue-50 p-6 rounded-xl mb-6 text-left">
                        <h4 class="font-semibold text-blue-800 mb-3">🛠️ Pasos para Solucionarlo:</h4>
                        <ol class="text-blue-700 space-y-2 text-sm">
                            <li><strong>1.</strong> Ve a <a href="https://console.firebase.google.com/" target="_blank" class="underline">Firebase Console</a></li>
                            <li><strong>2.</strong> Selecciona tu proyecto "soulcare-7e377"</li>
                            <li><strong>3.</strong> Ve a <strong>Authentication</strong> → <strong>Sign-in method</strong></li>
                            <li><strong>4.</strong> En <strong>Google</strong>, haz clic en <strong>Configurar</strong></li>
                            <li><strong>5.</strong> En <strong>Authorized domains</strong>, agrega:</li>
                            <ul class="ml-4 mt-2 space-y-1">
                                <li>• <code class="bg-blue-100 px-2 py-1 rounded">localhost</code></li>
                                <li>• <code class="bg-blue-100 px-2 py-1 rounded">127.0.0.1</code></li>
                                <li>• <code class="bg-blue-100 px-2 py-1 rounded">file://</code></li>
                                <li>• <code class="bg-blue-100 px-2 py-1 rounded">souldamaris.github.io</code></li>
                            </ul>
                            <li><strong>6.</strong> Haz clic en <strong>Save</strong></li>
                            <li><strong>7.</strong> Espera 5-10 minutos y recarga la página</li>
                        </ol>
                    </div>
                    
                    <div class="bg-green-50 p-4 rounded-lg mb-6">
                        <p class="text-green-700 text-sm">
                            <strong>💡 Alternativa:</strong> Puedes usar Firebase Hosting ejecutando:
                            <code class="block bg-green-100 p-2 rounded mt-2 text-xs">firebase deploy --only hosting</code>
                        </p>
                    </div>
                    
                    <div class="flex gap-4 justify-center">
                        <button id="retry-login" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                            🔄 Intentar de Nuevo
                        </button>
                        <button id="close-domain-error" class="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors">
                            ✖️ Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);
        
        // Event listeners
        document.getElementById('retry-login').addEventListener('click', () => {
            errorModal.remove();
            this.handleGoogleLogin();
        });
        
        document.getElementById('close-domain-error').addEventListener('click', () => {
            errorModal.remove();
        });
        
        // Cerrar al hacer clic fuera del modal
        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) {
                errorModal.remove();
            }
        });
    }

    async handleLogout() {
        try {
            if (window.auth && window.firebaseAuth) {
                await window.firebaseAuth.signOut(window.auth);
                this.showSuccess('Sesión cerrada correctamente');
            } else {
                this.currentUser = null;
                this.showAuthScreen();
            }
        } catch (error) {
            this.showError('Error al cerrar sesión: ' + error.message);
        }
    }

    showAuthScreen() {
        document.getElementById('auth-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }

    showMainApp() {
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        this.showSection('emotion-diary-section');
    }

    showLoginForm() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
    }

    showRegisterForm() {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    }

    updateUserInfo() {
        if (this.currentUser) {
            // Cargar datos del perfil guardado
            const savedProfile = localStorage.getItem('soulcare_profile');
            if (savedProfile) {
                const profileData = JSON.parse(savedProfile);
                const fullName = `${profileData.name} ${profileData.lastname}`;
                const initial = profileData.name.charAt(0).toUpperCase();
                
                document.getElementById('user-name').textContent = fullName;
                document.getElementById('user-initial').textContent = initial;
                document.getElementById('welcome-name').textContent = fullName;
                document.getElementById('dropdown-user-name').textContent = fullName;
                document.getElementById('dropdown-user-initial').textContent = initial;
                document.getElementById('dropdown-user-email').textContent = profileData.email;
            } else {
                // Usar datos por defecto
                const name = this.currentUser.displayName || 'Usuario';
                const initial = name.charAt(0).toUpperCase();
                
                document.getElementById('user-name').textContent = name;
                document.getElementById('user-initial').textContent = initial;
                document.getElementById('welcome-name').textContent = name;
                document.getElementById('dropdown-user-name').textContent = name;
                document.getElementById('dropdown-user-initial').textContent = initial;
                document.getElementById('dropdown-user-email').textContent = this.currentUser.email || 'usuario@ejemplo.com';
            }
        }
    }

    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('[id$="-section"]').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Mostrar la sección seleccionada
        document.getElementById(sectionId).classList.remove('hidden');
        
        // Actualizar navegación activa
        this.updateActiveNavigation(sectionId);
        
        // Cargar datos específicos de la sección
        this.loadSectionData(sectionId);
    }

    updateActiveNavigation(sectionId) {
        // Remover clase activa de todos los botones
        document.querySelectorAll('[id$="-btn"]').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500');
        });
        
        // Agregar clase activa al botón correspondiente
        const buttonId = sectionId.replace('-section', '-btn');
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('ring-2', 'ring-blue-500');
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'statistics-section':
                this.loadStatistics();
                break;
            case 'emotion-diary-section':
                this.loadEmotionHistory();
                break;
        }
    }

    selectEmotion(e) {
        const button = e.target.closest('.emoji-btn');
        const emotion = button.dataset.emotion;
        const color = button.dataset.color;
        
        this.selectedEmotion = { emotion, color };
        
        // Efecto visual al seleccionar
        button.classList.add('animate-pulse');
        setTimeout(() => {
            button.classList.remove('animate-pulse');
        }, 1000);
        
        // Actualizar UI
        document.querySelectorAll('.emoji-btn').forEach(btn => {
            btn.classList.remove('ring-2', 'ring-blue-500', 'selected');
        });
        button.classList.add('ring-2', 'ring-blue-500', 'selected');
        
        // Actualizar texto de emoción seleccionada
        const emotionText = this.getEmotionText(emotion);
        document.getElementById('selected-emotion').innerHTML = `
            <span class="text-2xl mr-2" style="color: ${color}">${button.textContent}</span>
            <span>${emotionText}</span>
        `;
        
        // Habilitar botón de guardar con animación
        const saveBtn = document.getElementById('save-emotion');
        saveBtn.disabled = false;
        saveBtn.classList.add('animate-bounce');
        setTimeout(() => {
            saveBtn.classList.remove('animate-bounce');
        }, 1000);
        
        // Efecto de confeti para emociones positivas
        if (['muy-feliz', 'feliz', 'relajado', 'motivado', 'gratitud'].includes(emotion)) {
            this.showConfetti();
        }
    }

    getEmotionText(emotion) {
        const emotions = {
            'muy-feliz': 'Muy feliz',
            'feliz': 'Feliz',
            'neutral': 'Neutral',
            'triste': 'Triste',
            'muy-triste': 'Muy triste',
            'ansioso': 'Ansioso',
            'enojado': 'Enojado',
            'estresado': 'Estresado',
            'relajado': 'Relajado',
            'motivado': 'Motivado',
            'agotado': 'Agotado',
            'gratitud': 'Con gratitud'
        };
        return emotions[emotion] || emotion;
    }

    async saveEmotion() {
        if (!this.selectedEmotion) {
            this.showError('Por favor selecciona una emoción');
            return;
        }
        
        const text = document.getElementById('emotion-text').value;
        const today = new Date().toLocaleDateString('es-ES');
        
        const emotionEntry = {
            id: Date.now(),
            emotion: this.selectedEmotion.emotion,
            color: this.selectedEmotion.color,
            text: text,
            date: today,
            dayOfWeek: new Date().toLocaleDateString('es-ES', { weekday: 'long' }),
            hour: new Date().getHours(),
            timestamp: Date.now(),
            userId: this.currentUser ? this.currentUser.uid : 'anonymous'
        };
        
        try {
            // Verificar si ya existe una entrada para hoy
            const existingEntryIndex = this.emotions.findIndex(entry => 
                entry.date === today && entry.userId === emotionEntry.userId
            );

            if (existingEntryIndex !== -1) {
                // Actualizar entrada existente
                this.emotions[existingEntryIndex] = emotionEntry;
                this.showSuccess('¡Entrada del día actualizada!');
            } else {
                // Agregar nueva entrada
                this.emotions.push(emotionEntry);
                this.showSuccess('¡Nueva entrada guardada exitosamente!');
            }
            
            // Guardar en localStorage
            localStorage.setItem('soulcare_emotions', JSON.stringify(this.emotions));
            
            // Guardar en Firestore si está disponible
            if (window.db && window.firebaseFirestore && this.currentUser) {
                await window.firebaseFirestore.addDoc(
                    window.firebaseFirestore.collection(window.db, 'emotions'), 
                    emotionEntry
                );
                console.log('Emoción guardada en Firestore');
            }
            
            // Limpiar formulario
            document.getElementById('emotion-text').value = '';
            document.getElementById('selected-emotion').textContent = 'Selecciona una emoción';
            document.getElementById('save-emotion').disabled = true;
            
            // Remover selección visual
            document.querySelectorAll('.emoji-btn').forEach(btn => {
                btn.classList.remove('ring-2', 'ring-blue-500');
            });
            
            this.selectedEmotion = null;
            
            // Mostrar confeti para emociones positivas
            if (['muy-feliz', 'feliz', 'relajado', 'motivado', 'gratitud'].includes(emotionEntry.emotion)) {
                this.showConfetti();
            }
            
            // Verificar logros
            this.checkAchievements();
            
            // Actualizar estadísticas si están visibles
            if (!document.getElementById('statistics-section').classList.contains('hidden')) {
                this.loadStatistics();
            }
            
        } catch (error) {
            console.error('Error guardando emoción:', error);
            this.showError('Error al guardar la emoción');
        }
    }

    loadEmotionHistory() {
        const savedEmotions = localStorage.getItem('soulcare_emotions');
        if (savedEmotions) {
            this.emotions = JSON.parse(savedEmotions);
        }
    }

    loadUserData() {
        this.loadEmotionHistory();
        this.loadAchievements();
        this.loadSettings();
    }

    loadAchievements() {
        const savedAchievements = localStorage.getItem('soulcare_achievements');
        if (savedAchievements) {
            this.achievements = JSON.parse(savedAchievements);
        }
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('soulcare_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.isDarkMode = settings.darkMode || false;
            this.applyTheme();
        }
    }

    checkAchievements() {
        const newAchievements = [];
        
        // Logro: Primera entrada
        if (this.emotions.length === 1 && !this.achievements.includes('first-entry')) {
            newAchievements.push({
                id: 'first-entry',
                title: 'Primer Paso',
                description: 'Registraste tu primera emoción',
                icon: '🎉',
                date: new Date().toISOString()
            });
        }
        
        // Logro: Una semana consecutiva
        if (this.emotions.length >= 7 && !this.achievements.includes('week-streak')) {
            newAchievements.push({
                id: 'week-streak',
                title: 'Constancia',
                description: 'Has registrado emociones por 7 días',
                icon: '📅',
                date: new Date().toISOString()
            });
        }
        
        // Agregar nuevos logros
        newAchievements.forEach(achievement => {
            this.achievements.push(achievement);
            this.showAchievementNotification(achievement);
        });
        
        if (newAchievements.length > 0) {
            localStorage.setItem('soulcare_achievements', JSON.stringify(this.achievements));
        }
    }

    showAchievementNotification(achievement) {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-lg z-50 fade-in';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-2">${achievement.icon}</span>
                <div>
                    <div class="font-semibold">¡Logro Desbloqueado!</div>
                    <div class="text-sm">${achievement.title}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    loadStatistics() {
        this.createEmotionChart();
        this.createActivityChart();
        this.createWeeklySummary();
    }

    createWeeklySummary() {
        const summaryContainer = document.getElementById('weekly-summary');
        if (!summaryContainer) return;
        
        const weekData = this.getWeekActivityData();
        const totalEntries = weekData.data.reduce((sum, count) => sum + count, 0);
        const daysWithEntries = weekData.data.filter(count => count > 0).length;
        
        // Calcular emociones más frecuentes
        const emotionCounts = {};
        weekData.emotions.flat().forEach(emotion => {
            emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
        });
        
        const mostFrequentEmotion = Object.keys(emotionCounts).reduce((a, b) => 
            emotionCounts[a] > emotionCounts[b] ? a : b, 'neutral'
        );
        
        summaryContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div class="text-2xl font-bold text-blue-800">${totalEntries}</div>
                    <div class="text-sm text-blue-600">Entradas totales</div>
                </div>
                
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div class="text-2xl font-bold text-green-800">${daysWithEntries}</div>
                    <div class="text-sm text-green-600">Días activos</div>
                </div>
                
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div class="flex items-center">
                        <span class="text-2xl mr-2">${this.getEmotionEmoji(mostFrequentEmotion)}</span>
                        <div>
                            <div class="text-lg font-bold text-purple-800">${this.getEmotionText(mostFrequentEmotion)}</div>
                            <div class="text-sm text-purple-600">Emoción más frecuente</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-6">
                <h4 class="font-semibold text-gray-800 mb-3">Progreso Semanal</h4>
                <div class="space-y-2">
                    ${weekData.labels.map((day, index) => {
                        const count = weekData.data[index];
                        const percentage = Math.min((count / Math.max(...weekData.data, 1)) * 100, 100);
                        return `
                            <div class="flex items-center">
                                <div class="w-16 text-sm text-gray-600">${day}</div>
                                <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                                    <div class="bg-blue-500 h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
                                </div>
                                <div class="w-8 text-sm text-gray-600 text-right">${count}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    createEmotionChart() {
        const ctx = document.getElementById('emotion-chart').getContext('2d');
        
        // Datos de ejemplo para la última semana
        const lastWeek = this.getLastWeekEmotions();
        const emotionCounts = this.countEmotionsByType(lastWeek);
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(emotionCounts),
                datasets: [{
                    data: Object.values(emotionCounts),
                    backgroundColor: [
                        '#10B981', '#34D399', '#FBBF24', '#F59E0B', 
                        '#EF4444', '#8B5CF6', '#F97316', '#DC2626',
                        '#06B6D4', '#84CC16', '#6B7280', '#F59E0B'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createActivityChart() {
        const ctx = document.getElementById('activity-chart').getContext('2d');
        
        // Datos reales de la semana
        const weekData = this.getWeekActivityData();
        
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weekData.labels,
                datasets: [{
                    label: 'Entradas del Diario',
                    data: weekData.data,
                    backgroundColor: '#3B82F6',
                    borderRadius: 8,
                    borderColor: '#1D4ED8',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const dayIndex = elements[0].index;
                        this.showDayDetails(weekData.emotions[dayIndex], weekData.labels[dayIndex]);
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                const dayIndex = context.dataIndex;
                                const emotions = weekData.emotions[dayIndex];
                                if (emotions.length === 0) {
                                    return 'Sin entradas';
                                }
                                return emotions.map(e => `${e.emotion}: ${e.text || 'Sin descripción'}`).join('\n');
                            }
                        }
                    }
                }
            }
        });
        
        // Hacer el gráfico clickeable
        ctx.canvas.style.cursor = 'pointer';
    }

    showDayDetails(emotions, dayName) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        const emotionsContent = emotions.length === 0 
            ? '<p class="text-gray-500 text-center py-8">No hay entradas para este día</p>'
            : emotions.map(emotion => `
                <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div class="flex items-center mb-3">
                        <span class="text-2xl mr-3" style="color: ${emotion.color}">
                            ${this.getEmotionEmoji(emotion.emotion)}
                        </span>
                        <div>
                            <h4 class="font-semibold text-gray-800">${this.getEmotionText(emotion.emotion)}</h4>
                            <p class="text-sm text-gray-500">${new Date(emotion.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                    ${emotion.text ? `<p class="text-gray-700">${emotion.text}</p>` : '<p class="text-gray-400 italic">Sin descripción</p>'}
                </div>
            `).join('');
        
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-800">Entradas del ${dayName}</h3>
                    <button id="close-day-details" class="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-4">
                    ${emotionsContent}
                </div>
                
                <div class="mt-6 flex justify-center">
                    <button id="close-day-details-btn" class="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar botones de cierre
        document.getElementById('close-day-details').addEventListener('click', () => modal.remove());
        document.getElementById('close-day-details-btn').addEventListener('click', () => modal.remove());
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getEmotionEmoji(emotion) {
        const emojis = {
            'muy-feliz': '😄',
            'feliz': '😊',
            'neutral': '😐',
            'triste': '😢',
            'muy-triste': '😭',
            'ansioso': '😰',
            'enojado': '😠',
            'estresado': '😫',
            'relajado': '😌',
            'motivado': '💪',
            'gratitud': '🙏',
            'confundido': '😕',
            'orgulloso': '😤'
        };
        return emojis[emotion] || '😐';
    }

    getLastWeekEmotions() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return this.emotions.filter(emotion => emotion.timestamp >= oneWeekAgo);
    }

    countEmotionsByType(emotions) {
        const counts = {};
        emotions.forEach(emotion => {
            const emotionText = this.getEmotionText(emotion.emotion);
            counts[emotionText] = (counts[emotionText] || 0) + 1;
        });
        return counts;
    }

    getWeekActivityData() {
        const weekData = {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            data: [0, 0, 0, 0, 0, 0, 0],
            emotions: [[], [], [], [], [], [], []]
        };
        
        // Obtener datos de los últimos 7 días
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('es-ES');
            
            // Buscar emociones para este día
            const dayEmotions = this.emotions.filter(emotion => emotion.date === dateString);
            weekData.data[6 - i] = dayEmotions.length;
            weekData.emotions[6 - i] = dayEmotions;
        }
        
        return weekData;
    }

    setupMeditationButtons() {
        // Configurar botones de meditación
        document.getElementById('meditation-guided-btn').addEventListener('click', () => {
            this.startMeditationSession('guided', 'Meditación Guiada', 'Relájate con una meditación de 10 minutos diseñada para calmar tu mente', 10, '🧘‍♀️');
        });
        
        document.getElementById('meditation-nature-btn').addEventListener('click', () => {
            this.startMeditationSession('nature', 'Sonidos de la Naturaleza', 'Escucha el sonido relajante del océano y pájaros cantando', 30, '🌊');
        });
        
        document.getElementById('meditation-breathing-btn').addEventListener('click', () => {
            this.startMeditationSession('breathing', 'Respiración Profunda', 'Ejercicio de respiración de 5 minutos para reducir la ansiedad', 5, '🕯️');
        });
        
        // Configurar controles del cronómetro
        document.getElementById('start-meditation-btn').addEventListener('click', () => this.startTimer());
        document.getElementById('pause-meditation-btn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('stop-meditation-btn').addEventListener('click', () => this.stopTimer());
        document.getElementById('back-to-meditation-btn').addEventListener('click', () => this.backToMeditationMenu());
        
        // Controles de audio
        document.getElementById('play-audio-btn').addEventListener('click', () => this.playMeditationAudio());
        document.getElementById('pause-audio-btn').addEventListener('click', () => this.pauseMeditationAudio());
    }

    setupWorkshopButtons() {
        // Configurar botones de talleres
        document.getElementById('workshop-emotional-intelligence-btn').addEventListener('click', () => {
            this.startWorkshopSession('emotional-intelligence', 'Inteligencia Emocional', 'Aprende a identificar, entender y manejar tus emociones de manera saludable', 45, '🧠', 'Principiante');
        });
        
        document.getElementById('workshop-emotional-intelligence-details-btn').addEventListener('click', () => {
            this.showWorkshopDetails('emotional-intelligence', 'Inteligencia Emocional', 'Aprende a identificar, entender y manejar tus emociones de manera saludable. Este taller te ayudará a desarrollar habilidades emocionales fundamentales.', 45, 'Principiante', 4.8);
        });
        
        document.getElementById('workshop-stress-management-btn').addEventListener('click', () => {
            this.startWorkshopSession('stress-management', 'Manejo del Estrés', 'Técnicas prácticas para reducir el estrés y la ansiedad en tu vida diaria', 30, '😌', 'Intermedio');
        });
        
        document.getElementById('workshop-stress-management-details-btn').addEventListener('click', () => {
            this.showWorkshopDetails('stress-management', 'Manejo del Estrés', 'Técnicas prácticas para reducir el estrés y la ansiedad en tu vida diaria. Aprende herramientas efectivas para mantener la calma.', 30, 'Intermedio', 4.9);
        });
        
        document.getElementById('workshop-self-esteem-btn').addEventListener('click', () => {
            this.startWorkshopSession('self-esteem', 'Autoestima y Confianza', 'Construye una imagen positiva de ti mismo y desarrolla tu confianza personal', 60, '💪', 'Avanzado');
        });
        
        document.getElementById('workshop-self-esteem-details-btn').addEventListener('click', () => {
            this.showWorkshopDetails('self-esteem', 'Autoestima y Confianza', 'Construye una imagen positiva de ti mismo y desarrolla tu confianza personal. Aprende a valorarte y proyectar seguridad.', 60, 'Avanzado', 4.7);
        });
    }

    setupUserMenu() {
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        
        // Toggle del menú desplegable
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('hidden');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!userMenuBtn.contains(e.target) && !userMenuDropdown.contains(e.target)) {
                userMenuDropdown.classList.add('hidden');
            }
        });
        
        // Configurar botones del menú
        document.getElementById('edit-profile-btn').addEventListener('click', () => {
            this.showSection('edit-profile-section');
            userMenuDropdown.classList.add('hidden');
        });
        
        document.getElementById('preferences-btn').addEventListener('click', () => {
            this.showSection('preferences-section');
            userMenuDropdown.classList.add('hidden');
        });
        
        document.getElementById('achievements-btn').addEventListener('click', () => {
            this.showAchievementsModal();
            userMenuDropdown.classList.add('hidden');
        });
        
        document.getElementById('data-export-btn').addEventListener('click', () => {
            this.exportUserData();
            userMenuDropdown.classList.add('hidden');
        });
        
        document.getElementById('help-support-btn').addEventListener('click', () => {
            this.showHelpSupport();
            userMenuDropdown.classList.add('hidden');
        });
        
        document.getElementById('logout-btn-menu').addEventListener('click', () => {
            this.handleLogout();
            userMenuDropdown.classList.add('hidden');
        });
        
        // Configurar formulario de edición de perfil
        this.setupProfileForm();
        
        // Configurar formulario de preferencias
        this.setupPreferencesForm();
    }

    setupProfileForm() {
        const profileForm = document.getElementById('edit-profile-form');
        const cancelBtn = document.getElementById('cancel-profile-edit');
        
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
        
        cancelBtn.addEventListener('click', () => {
            this.showSection('emotion-diary-section');
        });
    }

    setupPreferencesForm() {
        const savePreferencesBtn = document.getElementById('save-preferences');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        
        savePreferencesBtn.addEventListener('click', () => {
            this.savePreferences();
        });
        
        // Sincronizar toggle de modo oscuro con el estado actual
        darkModeToggle.addEventListener('change', (e) => {
            this.isDarkMode = e.target.checked;
            this.applyTheme();
        });
        
        // Cargar preferencias guardadas
        this.loadPreferences();
    }

    saveProfile() {
        const profileData = {
            name: document.getElementById('profile-name').value,
            lastname: document.getElementById('profile-lastname').value,
            email: document.getElementById('profile-email').value,
            phone: document.getElementById('profile-phone').value,
            birthdate: document.getElementById('profile-birthdate').value,
            gender: document.getElementById('profile-gender').value,
            bio: document.getElementById('profile-bio').value
        };
        
        // Guardar en localStorage (en producción sería Firestore)
        localStorage.setItem('soulcare_profile', JSON.stringify(profileData));
        
        // Actualizar información del usuario en la UI
        this.updateUserProfile(profileData);
        
        this.showSuccess('¡Perfil actualizado exitosamente!');
        this.showSection('emotion-diary-section');
    }

    updateUserProfile(profileData) {
        const fullName = `${profileData.name} ${profileData.lastname}`;
        const initial = profileData.name.charAt(0).toUpperCase();
        
        // Actualizar elementos de la UI
        document.getElementById('user-name').textContent = fullName;
        document.getElementById('user-initial').textContent = initial;
        document.getElementById('welcome-name').textContent = fullName;
        document.getElementById('dropdown-user-name').textContent = fullName;
        document.getElementById('dropdown-user-initial').textContent = initial;
        document.getElementById('dropdown-user-email').textContent = profileData.email;
        document.getElementById('profile-avatar').textContent = initial;
    }

    savePreferences() {
        const preferences = {
            darkMode: document.getElementById('dark-mode-toggle').checked,
            animations: document.getElementById('animations-toggle').checked,
            dailyReminders: document.getElementById('daily-reminders').checked,
            achievementNotifications: document.getElementById('achievement-notifications').checked,
            contentNotifications: document.getElementById('content-notifications').checked,
            anonymousData: document.getElementById('anonymous-data').checked,
            publicProfile: document.getElementById('public-profile').checked
        };
        
        localStorage.setItem('soulcare_preferences', JSON.stringify(preferences));
        
        // Aplicar cambios inmediatamente
        this.isDarkMode = preferences.darkMode;
        this.applyTheme();
        
        this.showSuccess('¡Preferencias guardadas exitosamente!');
        this.showSection('emotion-diary-section');
    }

    loadPreferences() {
        const savedPreferences = localStorage.getItem('soulcare_preferences');
        if (savedPreferences) {
            const preferences = JSON.parse(savedPreferences);
            
            // Aplicar preferencias a los toggles
            document.getElementById('dark-mode-toggle').checked = preferences.darkMode || false;
            document.getElementById('animations-toggle').checked = preferences.animations !== false;
            document.getElementById('daily-reminders').checked = preferences.dailyReminders !== false;
            document.getElementById('achievement-notifications').checked = preferences.achievementNotifications !== false;
            document.getElementById('content-notifications').checked = preferences.contentNotifications !== false;
            document.getElementById('anonymous-data').checked = preferences.anonymousData || false;
            document.getElementById('public-profile').checked = preferences.publicProfile || false;
            
            // Aplicar modo oscuro si está habilitado
            this.isDarkMode = preferences.darkMode || false;
            this.applyTheme();
        }
    }

    showAchievementsModal() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Mis Logros</h3>
                    <button id="close-achievements" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${this.achievements.map(achievement => `
                        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900 p-4 rounded-xl border border-yellow-200 dark:border-yellow-700">
                            <div class="flex items-center space-x-3">
                                <div class="text-3xl">${achievement.icon}</div>
                                <div>
                                    <h4 class="font-semibold text-gray-800 dark:text-white">${achievement.title}</h4>
                                    <p class="text-sm text-gray-600 dark:text-gray-300">${achievement.description}</p>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">${new Date(achievement.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="mt-6 text-center">
                    <p class="text-gray-600 dark:text-gray-400">¡Sigue así para desbloquear más logros!</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar botón de cerrar
        document.getElementById('close-achievements').addEventListener('click', () => {
            modal.remove();
        });
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    exportUserData() {
        const userData = {
            profile: JSON.parse(localStorage.getItem('soulcare_profile') || '{}'),
            emotions: this.emotions,
            achievements: this.achievements,
            preferences: JSON.parse(localStorage.getItem('soulcare_preferences') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `soulcare-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showSuccess('¡Datos exportados exitosamente!');
    }

    showHelpSupport() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-800 dark:text-white">Ayuda y Soporte</h3>
                    <button id="close-help" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-xl">
                        <h4 class="font-semibold text-blue-800 dark:text-blue-200 mb-2">📧 Contacto</h4>
                        <p class="text-blue-700 dark:text-blue-300">Email: soporte@soulcare.com</p>
                        <p class="text-blue-700 dark:text-blue-300">Teléfono: +1 (555) 123-4567</p>
                    </div>
                    
                    <div class="bg-green-50 dark:bg-green-900 p-4 rounded-xl">
                        <h4 class="font-semibold text-green-800 dark:text-green-200 mb-2">❓ Preguntas Frecuentes</h4>
                        <div class="space-y-2 text-green-700 dark:text-green-300">
                            <p><strong>¿Cómo registro mis emociones?</strong></p>
                            <p>Ve a "Diario Emocional" y selecciona un emoji que represente cómo te sientes.</p>
                            
                            <p><strong>¿Mis datos están seguros?</strong></p>
                            <p>Sí, todos tus datos están encriptados y protegidos.</p>
                            
                            <p><strong>¿Puedo cambiar mi tema?</strong></p>
                            <p>Sí, ve a Preferencias y activa el modo oscuro.</p>
                        </div>
                    </div>
                    
                    <div class="bg-purple-50 dark:bg-purple-900 p-4 rounded-xl">
                        <h4 class="font-semibold text-purple-800 dark:text-purple-200 mb-2">📚 Recursos</h4>
                        <div class="space-y-2 text-purple-700 dark:text-purple-300">
                            <p>• Guía de usuario completa</p>
                            <p>• Tutoriales en video</p>
                            <p>• Comunidad de usuarios</p>
                            <p>• Blog de bienestar mental</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar botón de cerrar
        document.getElementById('close-help').addEventListener('click', () => {
            modal.remove();
        });
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Variables para el cronómetro de meditación
    meditationTimer = null;
    meditationTimeLeft = 0;
    meditationTotalTime = 0;
    meditationType = '';
    isPaused = false;

    startMeditationSession(type, title, description, duration, icon) {
        this.meditationType = type;
        this.meditationTotalTime = duration * 60; // Convertir a segundos
        this.meditationTimeLeft = this.meditationTotalTime;
        this.isPaused = false;
        
        // Actualizar la interfaz del cronómetro
        document.getElementById('meditation-icon').textContent = icon;
        document.getElementById('meditation-title').textContent = title;
        document.getElementById('meditation-description').textContent = description;
        document.getElementById('timer-display').textContent = this.formatTime(this.meditationTimeLeft);
        document.getElementById('timer-status').textContent = 'Listo para comenzar';
        
        // Actualizar instrucciones según el tipo
        this.updateMeditationInstructions(type);
        
        // Mostrar la sección del cronómetro
        document.getElementById('meditation-timer-section').classList.remove('hidden');
        
        // Resetear controles
        document.getElementById('start-meditation-btn').classList.remove('hidden');
        document.getElementById('pause-meditation-btn').classList.add('hidden');
        document.getElementById('stop-meditation-btn').classList.add('hidden');
        
        // Resetear progreso
        this.updateProgress(0);
        
        this.showSuccess(`¡${title} configurado! Tiempo: ${duration} minutos`);
    }

    updateMeditationInstructions(type) {
        const instructionsElement = document.getElementById('meditation-instructions');
        let instructions = '';
        
        switch(type) {
            case 'guided':
                instructions = `
                    <p>• Encuentra una posición cómoda</p>
                    <p>• Cierra los ojos suavemente</p>
                    <p>• Respira profundamente</p>
                    <p>• Deja que tu mente se relaje</p>
                    <p>• Sigue las instrucciones de voz</p>
                `;
                break;
            case 'nature':
                instructions = `
                    <p>• Siéntate cómodamente</p>
                    <p>• Cierra los ojos</p>
                    <p>• Escucha los sonidos de la naturaleza</p>
                    <p>• Imagina estar en ese lugar</p>
                    <p>• Deja que los sonidos te relajen</p>
                `;
                break;
            case 'breathing':
                instructions = `
                    <p>• Siéntate con la espalda recta</p>
                    <p>• Coloca una mano en el pecho</p>
                    <p>• Inhala por 4 segundos</p>
                    <p>• Mantén por 4 segundos</p>
                    <p>• Exhala por 6 segundos</p>
                `;
                break;
        }
        
        instructionsElement.innerHTML = instructions;
    }

    startTimer() {
        if (this.meditationTimer) {
            clearInterval(this.meditationTimer);
        }
        
        this.isPaused = false;
        document.getElementById('timer-status').textContent = 'Meditando...';
        document.getElementById('start-meditation-btn').classList.add('hidden');
        document.getElementById('pause-meditation-btn').classList.remove('hidden');
        document.getElementById('stop-meditation-btn').classList.remove('hidden');
        
        // Agregar animaciones
        document.getElementById('meditation-icon').classList.add('meditation-timer-active');
        if (this.meditationType === 'breathing') {
            document.getElementById('meditation-icon').classList.add('meditation-breathing');
        }
        
        // Iniciar audio automáticamente si está disponible
        const audio = document.getElementById('meditation-audio');
        if (audio && this.meditationType === 'nature') {
            audio.play().catch(error => {
                console.log('Audio no disponible:', error);
            });
        }
        
        this.meditationTimer = setInterval(() => {
            this.meditationTimeLeft--;
            this.updateTimerDisplay();
            
            if (this.meditationTimeLeft <= 0) {
                this.completeMeditation();
            }
        }, 1000);
        
        this.showSuccess('¡Meditación iniciada! Disfruta de tu sesión.');
    }

    pauseTimer() {
        if (this.meditationTimer) {
            clearInterval(this.meditationTimer);
            this.meditationTimer = null;
        }
        
        this.isPaused = true;
        document.getElementById('timer-status').textContent = 'Pausado';
        document.getElementById('pause-meditation-btn').classList.add('hidden');
        document.getElementById('start-meditation-btn').classList.remove('hidden');
        
        // Pausar audio si está reproduciéndose
        const audio = document.getElementById('meditation-audio');
        if (audio && !audio.paused) {
            audio.pause();
        }
        
        // Remover animaciones
        document.getElementById('meditation-icon').classList.remove('meditation-timer-active', 'meditation-breathing');
        
        this.showSuccess('Meditación pausada');
    }

    stopTimer() {
        if (this.meditationTimer) {
            clearInterval(this.meditationTimer);
            this.meditationTimer = null;
        }
        
        this.meditationTimeLeft = this.meditationTotalTime;
        this.isPaused = false;
        this.updateTimerDisplay();
        
        document.getElementById('timer-status').textContent = 'Detenido';
        document.getElementById('start-meditation-btn').classList.remove('hidden');
        document.getElementById('pause-meditation-btn').classList.add('hidden');
        document.getElementById('stop-meditation-btn').classList.add('hidden');
        
        // Detener y reiniciar audio
        this.stopMeditationAudio();
        
        // Remover animaciones
        document.getElementById('meditation-icon').classList.remove('meditation-timer-active', 'meditation-breathing');
        
        this.updateProgress(0);
        this.showSuccess('Meditación detenida');
    }

    completeMeditation() {
        if (this.meditationTimer) {
            clearInterval(this.meditationTimer);
            this.meditationTimer = null;
        }
        
        document.getElementById('timer-status').textContent = '¡Completado!';
        document.getElementById('start-meditation-btn').classList.add('hidden');
        document.getElementById('pause-meditation-btn').classList.add('hidden');
        document.getElementById('stop-meditation-btn').classList.remove('hidden');
        
        // Detener audio
        this.stopMeditationAudio();
        
        // Remover animaciones
        document.getElementById('meditation-icon').classList.remove('meditation-timer-active', 'meditation-breathing');
        
        this.updateProgress(100);
        
        // Mostrar confeti de celebración
        this.showConfetti();
        
        // Agregar logro
        this.addAchievement('meditation-complete', '🧘‍♀️', 'Primera Meditación', '¡Completaste tu primera sesión de meditación!');
        
        this.showSuccess('¡Felicitaciones! Has completado tu sesión de meditación.');
        
        // Auto-volver al menú después de 3 segundos
        setTimeout(() => {
            this.backToMeditationMenu();
        }, 3000);
    }

    updateTimerDisplay() {
        document.getElementById('timer-display').textContent = this.formatTime(this.meditationTimeLeft);
        
        // Actualizar progreso
        const progress = ((this.meditationTotalTime - this.meditationTimeLeft) / this.meditationTotalTime) * 100;
        this.updateProgress(progress);
    }

    updateProgress(percentage) {
        document.getElementById('progress-bar').style.width = `${percentage}%`;
        document.getElementById('progress-text').textContent = `Progreso: ${Math.round(percentage)}%`;
        
        // Actualizar círculo de progreso SVG
        const circumference = 2 * Math.PI * 45; // radio = 45
        const offset = circumference - (percentage / 100) * circumference;
        document.getElementById('progress-circle').style.strokeDashoffset = offset;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    backToMeditationMenu() {
        // Detener el timer si está corriendo
        if (this.meditationTimer) {
            clearInterval(this.meditationTimer);
            this.meditationTimer = null;
        }
        
        // Pausar y detener el audio
        this.stopMeditationAudio();
        
        // Remover animaciones
        document.getElementById('meditation-icon').classList.remove('meditation-timer-active', 'meditation-breathing');
        
        // Ocultar la sección del cronómetro
        document.getElementById('meditation-timer-section').classList.add('hidden');
        
        // Resetear variables
        this.meditationTimeLeft = 0;
        this.meditationTotalTime = 0;
        this.meditationType = '';
        this.isPaused = false;
    }

    playMeditationAudio() {
        const audio = document.getElementById('meditation-audio');
        const playBtn = document.getElementById('play-audio-btn');
        const pauseBtn = document.getElementById('pause-audio-btn');
        
        audio.play().then(() => {
            playBtn.classList.add('hidden');
            pauseBtn.classList.remove('hidden');
            this.showSuccess('Audio de meditación iniciado');
        }).catch(error => {
            console.error('Error al reproducir audio:', error);
            this.showError('No se pudo reproducir el audio. Verifica que el archivo esté disponible.');
        });
    }

    pauseMeditationAudio() {
        const audio = document.getElementById('meditation-audio');
        const playBtn = document.getElementById('play-audio-btn');
        const pauseBtn = document.getElementById('pause-audio-btn');
        
        audio.pause();
        playBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
        this.showSuccess('Audio pausado');
    }

    stopMeditationAudio() {
        const audio = document.getElementById('meditation-audio');
        const playBtn = document.getElementById('play-audio-btn');
        const pauseBtn = document.getElementById('pause-audio-btn');
        
        audio.pause();
        audio.currentTime = 0; // Reiniciar al inicio
        playBtn.classList.remove('hidden');
        pauseBtn.classList.add('hidden');
    }

    addAchievement(id, icon, title, description) {
        // Verificar si el logro ya existe
        const existingAchievement = this.achievements.find(achievement => achievement.id === id);
        if (existingAchievement) {
            return; // No agregar duplicados
        }
        
        const newAchievement = {
            id: id,
            icon: icon,
            title: title,
            description: description,
            date: new Date().toISOString()
        };
        
        this.achievements.push(newAchievement);
        
        // Guardar en localStorage
        localStorage.setItem('soulcare_achievements', JSON.stringify(this.achievements));
        
        // Actualizar contador de logros
        document.getElementById('achievements-count').textContent = this.achievements.length;
        
        // Mostrar notificación de logro
        this.showAchievementNotification(newAchievement);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg z-50 transform translate-x-full transition-transform duration-500';
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="text-3xl">${achievement.icon}</div>
                <div>
                    <h4 class="font-bold">¡Nuevo Logro!</h4>
                    <p class="text-sm opacity-90">${achievement.title}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto-remover después de 4 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 4000);
    }

    startWorkshopSession(id, title, description, duration, icon, level) {
        this.showWorkshopModal(id, title, description, duration, icon, level);
    }

    showWorkshopDetails(id, title, description, duration, level, rating) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-2xl font-bold text-gray-800">${title}</h3>
                    <button id="close-workshop-details" class="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="space-y-6">
                    <div class="text-center">
                        <div class="text-6xl mb-4">${this.getWorkshopIcon(id)}</div>
                        <p class="text-gray-600 text-lg">${description}</p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                            <h4 class="font-semibold text-blue-800 mb-2">⏱️ Duración</h4>
                            <p class="text-blue-700">${duration} minutos</p>
                        </div>
                        
                        <div class="bg-green-50 p-4 rounded-xl border border-green-200 shadow-sm">
                            <h4 class="font-semibold text-green-800 mb-2">📊 Nivel</h4>
                            <p class="text-green-700">${level}</p>
                        </div>
                        
                        <div class="bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm">
                            <h4 class="font-semibold text-yellow-800 mb-2">⭐ Calificación</h4>
                            <p class="text-yellow-700">${rating}/5</p>
                        </div>
                        
                        <div class="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-sm">
                            <h4 class="font-semibold text-purple-800 mb-2">👥 Participantes</h4>
                            <p class="text-purple-700">1,250+</p>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 class="font-semibold text-gray-800 mb-3">📋 Contenido del Taller:</h4>
                        <div class="space-y-2 text-gray-600">
                            ${this.getWorkshopContent(id)}
                        </div>
                    </div>
                    
                    <div class="flex justify-center space-x-4">
                        <button id="start-workshop-from-details" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Comenzar Taller
                        </button>
                        <button id="close-workshop-details-btn" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Configurar botones
        document.getElementById('close-workshop-details').addEventListener('click', () => modal.remove());
        document.getElementById('close-workshop-details-btn').addEventListener('click', () => modal.remove());
        document.getElementById('start-workshop-from-details').addEventListener('click', () => {
            modal.remove();
            this.startWorkshopSession(id, title, description, duration, this.getWorkshopIcon(id), level);
        });
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getWorkshopIcon(id) {
        const icons = {
            'emotional-intelligence': '🧠',
            'stress-management': '😌',
            'self-esteem': '💪'
        };
        return icons[id] || '🎓';
    }

    getWorkshopContent(id) {
        const content = {
            'emotional-intelligence': `
                <p>• Introducción a la inteligencia emocional</p>
                <p>• Identificación de emociones básicas</p>
                <p>• Técnicas de regulación emocional</p>
                <p>• Ejercicios prácticos de autoconocimiento</p>
                <p>• Estrategias para el manejo de conflictos</p>
            `,
            'stress-management': `
                <p>• Reconocimiento de síntomas de estrés</p>
                <p>• Técnicas de relajación progresiva</p>
                <p>• Mindfulness y atención plena</p>
                <p>• Gestión del tiempo y prioridades</p>
                <p>• Construcción de resiliencia</p>
            `,
            'self-esteem': `
                <p>• Análisis de autoimagen actual</p>
                <p>• Identificación de fortalezas personales</p>
                <p>• Técnicas de afirmaciones positivas</p>
                <p>• Superación de pensamientos negativos</p>
                <p>• Construcción de confianza personal</p>
            `
        };
        return content[id] || '<p>• Contenido del taller</p>';
    }

    showWorkshopModal(id, title, description, duration, icon, level) {
        const workshopData = this.getWorkshopData(id);
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h3 class="text-3xl font-bold text-gray-800">${title}</h3>
                        <p class="text-gray-600 mt-2">${description}</p>
                    </div>
                    <button id="close-workshop-modal" class="text-gray-500 hover:text-gray-700 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    <!-- Panel de lecciones -->
                    <div class="lg:col-span-1">
                        <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 sm:p-6 border border-blue-200 shadow-lg">
                            <h4 class="font-bold text-lg text-gray-800 mb-4 flex items-center">
                                <span class="mr-2">📚</span>
                                Lecciones del Curso
                            </h4>
                            <div class="space-y-3" id="lessons-list">
                                ${this.generateLessonsList(workshopData.lessons)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Contenido principal -->
                    <div class="lg:col-span-2">
                        <div class="bg-gray-50 rounded-xl p-4 sm:p-6 min-h-[400px] sm:min-h-[500px] border border-gray-200 shadow-lg">
                            <div id="workshop-content" class="space-y-6">
                                ${this.generateWorkshopIntro(workshopData)}
                            </div>
                        </div>
                        
                        <!-- Navegación -->
                        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                            <button id="prev-lesson" class="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md" disabled>
                                ← Anterior
                            </button>
                            
                            <div class="flex items-center space-x-4">
                                <span class="text-sm text-gray-600" id="lesson-counter">Lección 1 de ${workshopData.lessons.length}</span>
                                <div class="bg-gray-200 rounded-full h-2 w-32 shadow-inner">
                                    <div id="lesson-progress" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                            </div>
                            
                            <button id="next-lesson" class="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md">
                                Siguiente →
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 flex justify-center space-x-4">
                    <button id="close-workshop-modal-btn" class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-md">
                        Cerrar Curso
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Variables del curso
        let currentLesson = 0;
        let completedLessons = [];
        let quizAnswers = {};
        
        // Configurar navegación
        this.setupWorkshopNavigation(modal, workshopData, currentLesson, completedLessons, quizAnswers);
        
        // Configurar botones de cierre
        document.getElementById('close-workshop-modal').addEventListener('click', () => modal.remove());
        document.getElementById('close-workshop-modal-btn').addEventListener('click', () => modal.remove());
        
        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    getWorkshopData(id) {
        const workshops = {
            'emotional-intelligence': {
                title: 'Inteligencia Emocional',
                description: 'Aprende a identificar, entender y manejar tus emociones',
                lessons: [
                    {
                        title: 'Introducción a la Inteligencia Emocional',
                        content: `
                            <h3 class="text-2xl font-bold mb-4 text-black">¿Qué es la Inteligencia Emocional?</h3>
                            <p class="mb-4 text-gray-700">La inteligencia emocional es la capacidad de reconocer, entender y manejar nuestras propias emociones, así como las de los demás.</p>
                            <div class="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200 shadow-sm">
                                <h4 class="font-semibold mb-2 text-blue-800">Componentes principales:</h4>
                                <ul class="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Autoconciencia emocional</li>
                                    <li>Autorregulación</li>
                                    <li>Motivación</li>
                                    <li>Empatía</li>
                                    <li>Habilidades sociales</li>
                                </ul>
                            </div>
                        `,
                        exercise: {
                            type: 'reflection',
                            question: '¿Cuál de estos componentes crees que necesitas desarrollar más?',
                            options: ['Autoconciencia', 'Autorregulación', 'Empatía', 'Habilidades sociales']
                        }
                    },
                    {
                        title: 'Identificando Emociones Básicas',
                        content: `
                            <h3 class="text-2xl font-bold mb-4 text-black">Las 6 Emociones Básicas</h3>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <div class="bg-red-50 p-4 rounded-lg text-center border border-red-200 shadow-sm">
                                    <div class="text-4xl mb-2">😠</div>
                                    <h4 class="font-semibold text-red-800">Ira</h4>
                                </div>
                                <div class="bg-blue-50 p-4 rounded-lg text-center border border-blue-200 shadow-sm">
                                    <div class="text-4xl mb-2">😢</div>
                                    <h4 class="font-semibold text-blue-800">Tristeza</h4>
                                </div>
                                <div class="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200 shadow-sm">
                                    <div class="text-4xl mb-2">😨</div>
                                    <h4 class="font-semibold text-yellow-800">Miedo</h4>
                                </div>
                                <div class="bg-green-50 p-4 rounded-lg text-center border border-green-200 shadow-sm">
                                    <div class="text-4xl mb-2">😊</div>
                                    <h4 class="font-semibold text-green-800">Alegría</h4>
                                </div>
                            </div>
                            <p class="mb-4 text-gray-700">Cada emoción tiene una función específica y nos da información importante sobre nuestras necesidades.</p>
                        `,
                        exercise: {
                            type: 'quiz',
                            question: '¿Cuál es la función principal de la tristeza?',
                            options: ['Protegernos del peligro', 'Ayudarnos a procesar pérdidas', 'Motivarnos a actuar', 'Conectarnos con otros'],
                            correct: 1
                        }
                    },
                    {
                        title: 'Técnicas de Regulación Emocional',
                        content: `
                            <h3 class="text-2xl font-bold mb-4 text-black">Estrategias para Manejar Emociones</h3>
                            <div class="space-y-4">
                                <div class="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                                    <h4 class="font-semibold text-green-800 mb-2">🌬️ Respiración Profunda</h4>
                                    <p class="text-green-700">Inhala por 4 segundos, mantén por 4, exhala por 6. Repite 3 veces.</p>
                                </div>
                                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                                    <h4 class="font-semibold text-blue-800 mb-2">🧘‍♀️ Mindfulness</h4>
                                    <p class="text-blue-700">Observa tus emociones sin juzgarlas. "Estoy sintiendo ira" en lugar de "Estoy enojado".</p>
                                </div>
                                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
                                    <h4 class="font-semibold text-purple-800 mb-2">✍️ Diario Emocional</h4>
                                    <p class="text-purple-700">Escribe sobre tus emociones para entender mejor sus causas y patrones.</p>
                                </div>
                            </div>
                        `,
                        exercise: {
                            type: 'practice',
                            question: 'Practica la técnica de respiración profunda ahora mismo',
                            instruction: 'Sigue el patrón: Inhala (4s) → Mantén (4s) → Exhala (6s)'
                        }
                    }
                ]
            },
            'stress-management': {
                title: 'Manejo del Estrés',
                description: 'Técnicas prácticas para reducir el estrés y la ansiedad',
                lessons: [
                    {
                        title: 'Entendiendo el Estrés',
                        content: `
                            <h3 class="text-2xl font-bold mb-4 text-black">¿Qué es el Estrés?</h3>
                            <p class="mb-4 text-gray-700">El estrés es la respuesta natural de tu cuerpo ante situaciones desafiantes o amenazantes.</p>
                            <div class="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200 shadow-sm">
                                <h4 class="font-semibold mb-2 text-yellow-800">Tipos de estrés:</h4>
                                <ul class="list-disc list-inside space-y-1 text-yellow-700">
                                    <li><strong>Eustrés:</strong> Estrés positivo que nos motiva</li>
                                    <li><strong>Distrés:</strong> Estrés negativo que nos daña</li>
                                </ul>
                            </div>
                        `,
                        exercise: {
                            type: 'quiz',
                            question: '¿Cuál es la diferencia principal entre eustrés y distrés?',
                            options: ['No hay diferencia', 'El eustrés es positivo, el distrés es negativo', 'El distrés es más intenso', 'Solo el eustrés causa síntomas'],
                            correct: 1
                        }
                    },
                    {
                        title: 'Técnicas de Relajación',
                        content: `
                            <h3 class="text-2xl font-bold mb-4 text-black">Métodos de Relajación</h3>
                            <div class="space-y-4">
                                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                                    <h4 class="font-semibold text-blue-800 mb-2">🫁 Relajación Progresiva</h4>
                                    <p class="text-blue-700">Tensa y relaja cada grupo muscular, empezando por los pies hasta la cabeza.</p>
                                </div>
                                <div class="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                                    <h4 class="font-semibold text-green-800 mb-2">🧘‍♀️ Meditación</h4>
                                    <p class="text-green-700">Enfócate en tu respiración y observa tus pensamientos sin juzgarlos.</p>
                                </div>
                            </div>
                        `,
                        exercise: {
                            type: 'practice',
                            question: 'Practica la relajación progresiva',
                            instruction: 'Tensa cada músculo por 5 segundos, luego relaja por 10 segundos'
                        }
                    }
                ]
            },
            'self-esteem': {
                title: 'Autoestima y Confianza',
                description: 'Construye una imagen positiva de ti mismo',
                lessons: [
                    {
                        title: 'Entendiendo la Autoestima',
                        content: `
                            <h3 class="text-2xl font-bold mb-4 text-black">¿Qué es la Autoestima?</h3>
                            <p class="mb-4 text-gray-700">La autoestima es la valoración que tienes de ti mismo, basada en tus pensamientos, sentimientos y experiencias.</p>
                            <div class="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-200 shadow-sm">
                                <h4 class="font-semibold mb-2 text-purple-800">Componentes de la autoestima:</h4>
                                <ul class="list-disc list-inside space-y-1 text-purple-700">
                                    <li>Autoconcepto (cómo te ves)</li>
                                    <li>Autoimagen (cómo te percibes)</li>
                                    <li>Autovaloración (cuánto te valoras)</li>
                                </ul>
                            </div>
                        `,
                        exercise: {
                            type: 'reflection',
                            question: '¿Cómo describirías tu autoestima actual?',
                            options: ['Muy alta', 'Alta', 'Media', 'Baja', 'Muy baja']
                        }
                    }
                ]
            }
        };
        return workshops[id] || workshops['emotional-intelligence'];
    }

    generateLessonsList(lessons) {
        return lessons.map((lesson, index) => `
            <div class="flex items-center p-3 rounded-lg bg-white border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors lesson-item shadow-sm" data-lesson="${index}">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 shadow-sm">
                    <span class="text-sm font-semibold text-blue-600">${index + 1}</span>
                </div>
                <div class="flex-1">
                    <h5 class="font-medium text-gray-800 text-sm">${lesson.title}</h5>
                </div>
                <div class="w-4 h-4 rounded-full bg-gray-200 lesson-status" id="status-${index}"></div>
            </div>
        `).join('');
    }

    generateWorkshopIntro(workshopData) {
        return `
            <div class="text-center">
                <div class="text-6xl mb-4">${this.getWorkshopIcon(workshopData.title.toLowerCase().replace(' ', '-'))}</div>
                <h2 class="text-3xl font-bold text-black mb-4">¡Bienvenido al Curso!</h2>
                <p class="text-lg text-gray-600 mb-6">${workshopData.description}</p>
                <div class="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md">
                    <h3 class="font-semibold text-blue-800 mb-2">📋 Lo que aprenderás:</h3>
                    <ul class="text-blue-700 text-left space-y-1">
                        ${workshopData.lessons.map(lesson => `<li>• ${lesson.title}</li>`).join('')}
                    </ul>
                </div>
                <button id="start-course" class="mt-6 bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    Comenzar Curso
                </button>
            </div>
        `;
    }

    setupWorkshopNavigation(modal, workshopData, currentLesson, completedLessons, quizAnswers) {
        // Implementar navegación del curso
        const nextBtn = modal.querySelector('#next-lesson');
        const prevBtn = modal.querySelector('#prev-lesson');
        const contentDiv = modal.querySelector('#workshop-content');
        const counterSpan = modal.querySelector('#lesson-counter');
        const progressBar = modal.querySelector('#lesson-progress');
        
        const updateLesson = (lessonIndex) => {
            if (lessonIndex >= 0 && lessonIndex < workshopData.lessons.length) {
                currentLesson = lessonIndex;
                const lesson = workshopData.lessons[lessonIndex];
                
                contentDiv.innerHTML = `
                    <div class="space-y-6">
                        <div class="text-center">
                            <h2 class="text-2xl font-bold text-black mb-2">${lesson.title}</h2>
                        </div>
                        <div class="prose dark:prose-invert max-w-none">
                            ${lesson.content}
                        </div>
                        ${lesson.exercise ? this.generateExercise(lesson.exercise, lessonIndex) : ''}
                    </div>
                `;
                
                counterSpan.textContent = `Lección ${lessonIndex + 1} de ${workshopData.lessons.length}`;
                progressBar.style.width = `${((lessonIndex + 1) / workshopData.lessons.length) * 100}%`;
                
                // Actualizar botones
                prevBtn.disabled = lessonIndex === 0;
                nextBtn.textContent = lessonIndex === workshopData.lessons.length - 1 ? 'Finalizar Curso' : 'Siguiente →';
                
                // Actualizar estado de lecciones
                this.updateLessonStatus(modal, completedLessons);
            }
        };
        
        nextBtn.addEventListener('click', () => {
            if (currentLesson < workshopData.lessons.length - 1) {
                updateLesson(currentLesson + 1);
            } else {
                this.completeWorkshop(workshopData.title.toLowerCase().replace(' ', '-'), workshopData.title, modal);
            }
        });
        
        prevBtn.addEventListener('click', () => {
            if (currentLesson > 0) {
                updateLesson(currentLesson - 1);
            }
        });
        
        // Botón de comenzar curso
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'start-course') {
                updateLesson(0);
            }
        });
    }

    generateExercise(exercise, lessonIndex) {
        if (exercise.type === 'quiz') {
            return `
                <div class="bg-yellow-50 p-6 rounded-xl border border-yellow-200 shadow-md">
                    <h4 class="font-semibold text-yellow-800 mb-4">🧠 Ejercicio de Comprensión</h4>
                    <p class="mb-4 text-gray-700">${exercise.question}</p>
                    <div class="space-y-2">
                        ${exercise.options.map((option, index) => `
                            <label class="flex items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors border border-yellow-100 shadow-sm">
                                <input type="radio" name="quiz-${lessonIndex}" value="${index}" class="mr-3">
                                <span class="text-gray-700">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                    <button class="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md" onclick="this.checkQuizAnswer(${lessonIndex}, ${exercise.correct})">
                        Verificar Respuesta
                    </button>
                </div>
            `;
        } else if (exercise.type === 'reflection') {
            return `
                <div class="bg-green-50 p-6 rounded-xl border border-green-200 shadow-md">
                    <h4 class="font-semibold text-green-800 mb-4">💭 Reflexión Personal</h4>
                    <p class="mb-4 text-gray-700">${exercise.question}</p>
                    <div class="space-y-2">
                        ${exercise.options.map((option, index) => `
                            <label class="flex items-center p-3 bg-white rounded-lg cursor-pointer hover:bg-green-100 transition-colors border border-green-100 shadow-sm">
                                <input type="radio" name="reflection-${lessonIndex}" value="${index}" class="mr-3">
                                <span class="text-gray-700">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (exercise.type === 'practice') {
            return `
                <div class="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md">
                    <h4 class="font-semibold text-blue-800 mb-4">🎯 Ejercicio Práctico</h4>
                    <p class="mb-4 text-gray-700">${exercise.question}</p>
                    <div class="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                        <p class="text-gray-600">${exercise.instruction}</p>
                    </div>
                    <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md">
                        Completar Ejercicio
                    </button>
                </div>
            `;
        }
        return '';
    }

    updateLessonStatus(modal, completedLessons) {
        const lessonItems = modal.querySelectorAll('.lesson-item');
        lessonItems.forEach((item, index) => {
            const status = item.querySelector('.lesson-status');
            if (completedLessons.includes(index)) {
                status.className = 'w-4 h-4 rounded-full bg-green-500 shadow-sm';
            } else if (index === 0) {
                status.className = 'w-4 h-4 rounded-full bg-blue-500 shadow-sm';
            } else {
                status.className = 'w-4 h-4 rounded-full bg-gray-200 shadow-sm';
            }
        });
    }

    completeWorkshop(id, title, modal) {
        // Mostrar confeti
        this.showConfetti();
        
        // Agregar logro
        this.addAchievement(`workshop-${id}`, '🎓', `Curso Completado: ${title}`, `¡Has completado el curso de ${title}!`);
        
        // Mostrar mensaje de finalización
        const contentDiv = modal.querySelector('#workshop-content');
        contentDiv.innerHTML = `
            <div class="text-center">
                <div class="text-8xl mb-6">🎉</div>
                <h2 class="text-3xl font-bold text-black mb-4">¡Felicitaciones!</h2>
                <p class="text-lg text-gray-600 mb-6">Has completado exitosamente el curso de ${title}</p>
                <div class="bg-green-50 p-6 rounded-xl mb-6 border border-green-200 shadow-md">
                    <h3 class="font-semibold text-green-800 mb-2">🏆 Logros Desbloqueados:</h3>
                    <ul class="text-green-700 space-y-1">
                        <li>• Curso completado al 100%</li>
                        <li>• Nuevas habilidades desarrolladas</li>
                        <li>• Certificado de finalización</li>
                    </ul>
                </div>
                <button onclick="this.close()" class="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-md">
                    Cerrar Curso
                </button>
            </div>
        `;
        
        this.showSuccess(`¡Felicitaciones! Has completado el curso "${title}"`);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            modal.remove();
        }, 5000);
    }

    updateCurrentTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        this.saveSettings();
        
        // Efecto visual al cambiar tema
        const themeIcon = document.querySelector('#theme-toggle');
        themeIcon.classList.add('animate-spin');
        setTimeout(() => {
            themeIcon.classList.remove('animate-spin');
        }, 500);
    }

    applyTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('#theme-toggle svg');
        
        if (this.isDarkMode) {
            body.classList.add('dark');
            themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>';
            
            // Aplicar estilos específicos para modo oscuro
            this.applyDarkModeStyles();
        } else {
            body.classList.remove('dark');
            themeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>';
            
            // Remover estilos de modo oscuro
            this.removeDarkModeStyles();
        }
    }

    applyDarkModeStyles() {
        // Aplicar estilos específicos para modo oscuro
        const style = document.createElement('style');
        style.id = 'dark-mode-styles';
        style.textContent = `
            .dark .bg-gradient-to-br {
                background: linear-gradient(to bottom right, #1F2937, #374151) !important;
            }
            .dark .text-white {
                color: #F9FAFB !important;
            }
            .dark .border-gray-200 {
                border-color: #374151 !important;
            }
            .dark .shadow-xl {
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
            }
        `;
        document.head.appendChild(style);
    }

    removeDarkModeStyles() {
        const existingStyle = document.getElementById('dark-mode-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
    }

    saveSettings() {
        const settings = {
            darkMode: this.isDarkMode
        };
        localStorage.setItem('soulcare_settings', JSON.stringify(settings));
    }

    showConfetti() {
        // Crear efecto de confeti simple
        const confettiContainer = document.createElement('div');
        confettiContainer.style.position = 'fixed';
        confettiContainer.style.top = '0';
        confettiContainer.style.left = '0';
        confettiContainer.style.width = '100%';
        confettiContainer.style.height = '100%';
        confettiContainer.style.pointerEvents = 'none';
        confettiContainer.style.zIndex = '9999';
        
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `confettiFall ${Math.random() * 3 + 2}s linear forwards`;
            
            confettiContainer.appendChild(confetti);
        }
        
        document.body.appendChild(confettiContainer);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            confettiContainer.remove();
        }, 5000);
    }

    showNotifications() {
        // Crear panel de notificaciones
        const notificationPanel = document.createElement('div');
        notificationPanel.id = 'notification-panel';
        notificationPanel.className = 'fixed top-16 right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 z-50 max-w-sm';
        notificationPanel.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Notificaciones</h3>
                <button id="close-notifications" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="space-y-3">
                <div class="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <div class="text-blue-500">🔔</div>
                    <div>
                        <p class="text-sm font-medium text-blue-800 dark:text-blue-200">Recordatorio diario</p>
                        <p class="text-xs text-blue-600 dark:text-blue-300">¿Cómo te sientes hoy?</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                    <div class="text-green-500">🏆</div>
                    <div>
                        <p class="text-sm font-medium text-green-800 dark:text-green-200">¡Logro desbloqueado!</p>
                        <p class="text-xs text-green-600 dark:text-green-300">Primer Paso</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                    <div class="text-purple-500">🎓</div>
                    <div>
                        <p class="text-sm font-medium text-purple-800 dark:text-purple-200">Nuevo taller disponible</p>
                        <p class="text-xs text-purple-600 dark:text-purple-300">Inteligencia Emocional</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notificationPanel);
        
        // Configurar botón de cerrar
        document.getElementById('close-notifications').addEventListener('click', () => {
            notificationPanel.remove();
        });
        
        // Cerrar automáticamente después de 10 segundos
        setTimeout(() => {
            if (notificationPanel.parentNode) {
                notificationPanel.remove();
            }
        }, 10000);
    }

    showError(message) {
        // Crear notificación de error
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 fade-in';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-2">❌</span>
                <div>${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showSuccess(message) {
        // Crear notificación de éxito
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 fade-in';
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="text-xl mr-2">✅</span>
                <div>${message}</div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SoulCareApp();
});

// Funciones adicionales para funcionalidades específicas

// Notificaciones web
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Permisos de notificación concedidos');
            }
        });
    }
}

// Función para enviar notificaciones
function sendNotification(title, body, icon = null) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: icon || '/favicon.ico'
        });
    }
}

// Función para recordatorios diarios
function scheduleDailyReminder() {
    // Programar recordatorio para las 8 PM
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(20, 0, 0, 0);
    
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    setTimeout(() => {
        sendNotification(
            'SoulCare - Recordatorio Diario',
            '¿Cómo te sientes hoy? Tómate un momento para registrar tus emociones.',
            '/favicon.ico'
        );
        
        // Programar el siguiente recordatorio
        scheduleDailyReminder();
    }, timeUntilReminder);
}

// Solicitar permisos de notificación al cargar la página
requestNotificationPermission();
// ============================================
// FUNCIONALIDAD DE MEDITACIÓN MEJORADA
// ============================================

// Estado global de meditación
const meditationState = {
    meditationTimer: null,
    breathingTimer: null,
    audioElement: null,
    isPlaying: false
};

function iniciarMeditacionGuiada() {
    if (meditationState.meditationTimer) {
        clearInterval(meditationState.meditationTimer);
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'meditation-overlay';
    overlay.innerHTML = `
        <div class="meditation-modal">
            <button class="close-btn" onclick="cerrarMeditacion()">✕</button>
            <div class="meditation-content">
                <div class="meditation-icon">🧘</div>
                <h2>Meditación Guiada</h2>
                <p class="meditation-instruction">Siéntate cómodamente, cierra los ojos y respira profundamente</p>
                <div class="timer-display">
                    <span class="time" id="meditation-time">10:00</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="meditation-progress"></div>
                </div>
                <button class="control-btn pause-btn" onclick="pausarMeditacion()">⏸ Pausar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    let timeRemaining = 600;
    const progressBar = document.getElementById('meditation-progress');
    const timeDisplay = document.getElementById('meditation-time');
    
    meditationState.meditationTimer = setInterval(() => {
        timeRemaining--;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const progress = ((600 - timeRemaining) / 600) * 100;
        progressBar.style.width = progress + '%';
        
        if (timeRemaining <= 0) {
            clearInterval(meditationState.meditationTimer);
            mostrarCompletado('meditación');
        }
    }, 1000);
}

function pausarMeditacion() {
    const btn = event.target;
    if (meditationState.meditationTimer) {
        clearInterval(meditationState.meditationTimer);
        meditationState.meditationTimer = null;
        btn.textContent = '▶ Reanudar';
        btn.onclick = reanudarMeditacion;
    }
}

function reanudarMeditacion() {
    const btn = event.target;
    const timeDisplay = document.getElementById('meditation-time');
    const [minutes, seconds] = timeDisplay.textContent.split(':').map(Number);
    let timeRemaining = minutes * 60 + seconds;
    
    const progressBar = document.getElementById('meditation-progress');
    
    meditationState.meditationTimer = setInterval(() => {
        timeRemaining--;
        
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        const progress = ((600 - timeRemaining) / 600) * 100;
        progressBar.style.width = progress + '%';
        
        if (timeRemaining <= 0) {
            clearInterval(meditationState.meditationTimer);
            mostrarCompletado('meditación');
        }
    }, 1000);
    
    btn.textContent = '⏸ Pausar';
    btn.onclick = pausarMeditacion;
}

function cerrarMeditacion() {
    if (meditationState.meditationTimer) {
        clearInterval(meditationState.meditationTimer);
        meditationState.meditationTimer = null;
    }
    const overlay = document.querySelector('.meditation-overlay');
    if (overlay) overlay.remove();
}

function reproducirSonidos() {
    const overlay = document.createElement('div');
    overlay.className = 'meditation-overlay';
    overlay.innerHTML = `
        <div class="meditation-modal">
            <button class="close-btn" onclick="cerrarAudio()">✕</button>
            <div class="meditation-content">
                <div class="meditation-icon">🌊</div>
                <h2>Sonidos de la Naturaleza</h2>
                <p class="meditation-instruction">Océano y pájaros cantando</p>
                
                <div class="audio-player">
                    <div class="timer-display">
                        <span class="time" id="audio-current">0:00</span>
                        <span class="time-separator">/</span>
                        <span class="time" id="audio-total">30:00</span>
                    </div>
                    
                    <div class="progress-bar audio-progress" onclick="seekAudio(event)">
                        <div class="progress-fill" id="audio-progress"></div>
                    </div>
                    
                    <div class="audio-controls">
                        <button class="control-btn" onclick="reproducirPausar()">⏸ Pausar</button>
                        <button class="control-btn" onclick="reiniciarAudio()">↻ Reiniciar</button>
                    </div>
                    
                    <div class="volume-control">
                        <span>🔊</span>
                        <input type="range" id="volume-slider" min="0" max="100" value="70" onchange="cambiarVolumen(this.value)">
                    </div>
                </div>
                
                <audio id="nature-audio" loop>
                    <source src="https://cdn.pixabay.com/download/audio/2022/03/10/audio_d1718d5ba8.mp3" type="audio/mpeg">
                </audio>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    meditationState.audioElement = document.getElementById('nature-audio');
    meditationState.audioElement.volume = 0.7;
    meditationState.audioElement.play();
    meditationState.isPlaying = true;
    
    meditationState.audioElement.addEventListener('timeupdate', actualizarProgresoAudio);
}

function actualizarProgresoAudio() {
    if (!meditationState.audioElement) return;
    
    const currentTime = meditationState.audioElement.currentTime;
    const duration = 1800;
    
    const currentMins = Math.floor(currentTime / 60);
    const currentSecs = Math.floor(currentTime % 60);
    
    const currentDisplay = document.getElementById('audio-current');
    if (currentDisplay) {
        currentDisplay.textContent = `${currentMins}:${currentSecs.toString().padStart(2, '0')}`;
    }
    
    const progress = (currentTime / duration) * 100;
    const progressBar = document.getElementById('audio-progress');
    if (progressBar) {
        progressBar.style.width = Math.min(progress, 100) + '%';
    }
    
    if (currentTime >= duration) {
        meditationState.audioElement.pause();
        mostrarCompletado('sonidos');
    }
}

function reproducirPausar() {
    const btn = event.target;
    if (meditationState.audioElement) {
        if (meditationState.isPlaying) {
            meditationState.audioElement.pause();
            btn.textContent = '▶ Reproducir';
            meditationState.isPlaying = false;
        } else {
            meditationState.audioElement.play();
            btn.textContent = '⏸ Pausar';
            meditationState.isPlaying = true;
        }
    }
}

function reiniciarAudio() {
    if (meditationState.audioElement) {
        meditationState.audioElement.currentTime = 0;
        meditationState.audioElement.play();
        meditationState.isPlaying = true;
        const btn = document.querySelector('.audio-controls .control-btn');
        if (btn) btn.textContent = '⏸ Pausar';
    }
}

function cambiarVolumen(value) {
    if (meditationState.audioElement) {
        meditationState.audioElement.volume = value / 100;
    }
}

function seekAudio(event) {
    if (!meditationState.audioElement) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const duration = 1800;
    
    meditationState.audioElement.currentTime = percent * duration;
}

function cerrarAudio() {
    if (meditationState.audioElement) {
        meditationState.audioElement.pause();
        meditationState.audioElement.remove();
        meditationState.audioElement = null;
        meditationState.isPlaying = false;
    }
    const overlay = document.querySelector('.meditation-overlay');
    if (overlay) overlay.remove();
}

function iniciarRespiracion() {
    const overlay = document.createElement('div');
    overlay.className = 'meditation-overlay';
    overlay.innerHTML = `
        <div class="meditation-modal breathing-modal">
            <button class="close-btn" onclick="cerrarRespiracion()">✕</button>
            <div class="meditation-content">
                <div class="breathing-icon">🕯️</div>
                <h2>Respiración Profunda</h2>
                <p class="breathing-instruction" id="breathing-instruction">Prepárate...</p>
                
                <div class="breathing-circle" id="breathing-circle">
                    <div class="breathing-inner"></div>
                </div>
                
                <div class="timer-display">
                    <span class="time" id="breathing-time">5:00</span>
                </div>
                
                <div class="breathing-count">
                    <span>Ciclo <span id="cycle-count">0</span> de 10</span>
                </div>
                
                <button class="control-btn" onclick="pausarRespiracion()">⏸ Pausar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    iniciarCicloRespiracion();
}

function iniciarCicloRespiracion() {
    let timeRemaining = 300;
    let cycleCount = 0;
    let phase = 0;
    const phaseDurations = [4, 4, 6, 2];
    let phaseTime = 0;
    
    const circle = document.getElementById('breathing-circle');
    const instruction = document.getElementById('breathing-instruction');
    const timeDisplay = document.getElementById('breathing-time');
    const cycleDisplay = document.getElementById('cycle-count');
    
    const phases = ['Inhala profundamente...', 'Mantén...', 'Exhala lentamente...', 'Mantén...'];
    
    meditationState.breathingTimer = setInterval(() => {
        timeRemaining--;
        phaseTime++;
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (phaseTime >= phaseDurations[phase]) {
            phaseTime = 0;
            phase = (phase + 1) % 4;
            
            if (phase === 0) {
                cycleCount++;
                cycleDisplay.textContent = Math.min(cycleCount, 10);
            }
            
            instruction.textContent = phases[phase];
            
            circle.classList.remove('inhale', 'hold', 'exhale');
            if (phase === 0) circle.classList.add('inhale');
            else if (phase === 2) circle.classList.add('exhale');
            else circle.classList.add('hold');
        }
        
        if (timeRemaining <= 0) {
            clearInterval(meditationState.breathingTimer);
            mostrarCompletado('respiración');
        }
    }, 1000);
    
    instruction.textContent = phases[0];
    circle.classList.add('inhale');
}

function pausarRespiracion() {
    const btn = event.target;
    if (meditationState.breathingTimer) {
        clearInterval(meditationState.breathingTimer);
        meditationState.breathingTimer = null;
        btn.textContent = '▶ Reanudar';
        btn.onclick = () => {
            iniciarCicloRespiracion();
            btn.textContent = '⏸ Pausar';
            btn.onclick = pausarRespiracion;
        };
    }
}

function cerrarRespiracion() {
    if (meditationState.breathingTimer) {
        clearInterval(meditationState.breathingTimer);
        meditationState.breathingTimer = null;
    }
    const overlay = document.querySelector('.meditation-overlay');
    if (overlay) overlay.remove();
}

function mostrarCompletado(tipo) {
    const mensajes = {
        'meditación': '¡Meditación completada! 🎉',
        'sonidos': '¡Sesión de sonidos completada! 🎉',
        'respiración': '¡Ejercicio de respiración completado! 🎉'
    };
    
    const modal = document.querySelector('.meditation-modal');
    if (modal) {
        modal.innerHTML = `
            <button class="close-btn" onclick="cerrarTodo()">✕</button>
            <div class="meditation-content completion">
                <div class="completion-icon">✨</div>
                <h2>${mensajes[tipo]}</h2>
                <p>Has completado tu práctica con éxito</p>
                <button class="control-btn" onclick="cerrarTodo()">Finalizar</button>
            </div>
        `;
    }
}

function cerrarTodo() {
    cerrarMeditacion();
    cerrarAudio();
    cerrarRespiracion();
}
// Programar recordatorios diarios
scheduleDailyReminder();