/**
 * Servicio de Firebase - Gestión de autenticación y base de datos
 * @module firebase-service
 */

import { firebaseConfig, APP_CONSTANTS } from './config.js';

/**
 * Clase para gestionar servicios de Firebase
 */
export class FirebaseService {
    constructor() {
        this.app = null;
        this.auth = null;
        this.db = null;
        this.functions = null;
        this.appCheck = null;
        this.currentUser = null;
    }

    /**
     * Inicializa Firebase
     */
    async initialize() {
        try {
            // Inicializar Firebase App
            this.app = firebase.initializeApp(firebaseConfig);
            this.auth = firebase.auth();
            this.db = firebase.firestore();
            this.functions = firebase.functions();

            // Configurar nivel de log (solo en desarrollo)
            if (import.meta.env.VITE_ENV === 'development') {
                firebase.firestore.setLogLevel('debug');
            }

            console.log('✅ Firebase inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            throw error;
        }
    }

    /**
     * Inicializa App Check para seguridad adicional
     */
    async initializeAppCheck() {
        try {
            const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

            if (!recaptchaSiteKey) {
                console.warn('⚠️ reCAPTCHA site key no configurada');
                return false;
            }

            this.appCheck = firebase.appCheck();
            await this.appCheck.activate(recaptchaSiteKey, true);

            console.log('✅ App Check activado');
            return true;
        } catch (error) {
            console.error('❌ Error activando App Check:', error);
            return false;
        }
    }

    /**
     * Autentica un usuario con email y password
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Resultado de la autenticación
     */
    async signInWithEmail(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;

            console.log('✅ Usuario autenticado:', this.currentUser.uid);
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('❌ Error en autenticación:', error);
            return { success: false, error: this.getAuthErrorMessage(error.code) };
        }
    }

    /**
     * Autentica un administrador
     * @param {string} email - Email del admin
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} Resultado de la autenticación
     */
    async signInAdmin(email, password) {
        try {
            const result = await this.signInWithEmail(email, password);

            if (!result.success) {
                return result;
            }

            // Verificar que tenga rol de admin
            const token = await result.user.getIdTokenResult();

            if (!token.claims.admin) {
                await this.signOut();
                return {
                    success: false,
                    error: 'No tienes permisos de administrador'
                };
            }

            console.log('✅ Admin autenticado');
            return { success: true, user: result.user, isAdmin: true };
        } catch (error) {
            console.error('❌ Error en autenticación de admin:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cierra sesión del usuario actual
     */
    async signOut() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            console.log('✅ Sesión cerrada');
            return { success: true };
        } catch (error) {
            console.error('❌ Error cerrando sesión:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verifica si el usuario actual es admin
     * @returns {Promise<boolean>}
     */
    async isAdmin() {
        if (!this.currentUser) return false;

        try {
            const token = await this.currentUser.getIdTokenResult();
            return token.claims.admin === true;
        } catch (error) {
            console.error('Error verificando rol de admin:', error);
            return false;
        }
    }

    /**
     * Obtiene la referencia a la colección de fichas de salud
     * @returns {firebase.firestore.CollectionReference}
     */
    getHealthRecordsCollection() {
        const appId = import.meta.env.VITE_APP_ID || 'default-app-id';
        const path = APP_CONSTANTS.COLLECTION_PATH_TEMPLATE.replace('{appId}', appId);
        return this.db.collection(path);
    }

    /**
     * Crea una ficha de salud usando Cloud Function
     * @param {Object} data - Datos de la ficha
     * @returns {Promise<Object>}
     */
    async createHealthRecord(data) {
        try {
            const createFunction = this.functions.httpsCallable('createHealthRecord');
            const result = await createFunction(data);

            console.log('✅ Ficha creada:', result.data.id);
            return result.data;
        } catch (error) {
            console.error('❌ Error creando ficha:', error);
            return {
                success: false,
                error: error.message || 'Error al crear la ficha'
            };
        }
    }

    /**
     * Actualiza una ficha de salud usando Cloud Function
     * @param {string} documentId - ID del documento
     * @param {Object} data - Datos actualizados
     * @returns {Promise<Object>}
     */
    async updateHealthRecord(documentId, data) {
        try {
            const updateFunction = this.functions.httpsCallable('updateHealthRecord');
            const result = await updateFunction({ documentId, ...data });

            console.log('✅ Ficha actualizada:', documentId);
            return result.data;
        } catch (error) {
            console.error('❌ Error actualizando ficha:', error);
            return {
                success: false,
                error: error.message || 'Error al actualizar la ficha'
            };
        }
    }

    /**
     * Elimina una ficha de salud
     * @param {string} documentId - ID del documento
     * @returns {Promise<Object>}
     */
    async deleteHealthRecord(documentId) {
        try {
            await this.getHealthRecordsCollection().doc(documentId).delete();

            console.log('✅ Ficha eliminada:', documentId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando ficha:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Escucha cambios en las fichas de salud
     * @param {string} group - Grupo a filtrar ('all' para todos)
     * @param {Function} callback - Función a ejecutar cuando hay cambios
     * @returns {Function} Función para cancelar la escucha
     */
    listenToHealthRecords(group, callback) {
        let query = this.getHealthRecordsCollection();

        if (group !== 'all') {
            query = query.where('group', '==', group);
        }

        return query.onSnapshot(
            (snapshot) => {
                callback({ success: true, snapshot });
            },
            (error) => {
                console.error('Error en listener:', error);
                callback({ success: false, error: error.message });
            }
        );
    }

    /**
     * Obtiene un mensaje de error user-friendly
     * @param {string} errorCode - Código de error de Firebase
     * @returns {string}
     */
    getAuthErrorMessage(errorCode) {
        const errorMessages = {
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Usuario deshabilitado',
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/email-already-in-use': 'Email ya está en uso',
            'auth/weak-password': 'Contraseña muy débil',
            'auth/network-request-failed': 'Error de conexión',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
        };

        return errorMessages[errorCode] || 'Error de autenticación';
    }

    /**
     * Verifica el estado de autenticación
     * @param {Function} callback - Función a ejecutar cuando cambia el estado
     * @returns {Function} Función para cancelar la escucha
     */
    onAuthStateChanged(callback) {
        return this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            callback(user);
        });
    }
}

// Exportar instancia singleton
export const firebaseService = new FirebaseService();
