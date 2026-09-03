const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// ============================================
// VALIDACIÓN DE DATOS
// ============================================

/**
 * Valida los datos de una ficha de salud
 * @param {Object} data - Datos a validar
 * @returns {Array<string>} Array de errores (vacío si es válido)
 */
function validateHealthData(data) {
    const errors = [];

    // Validar nombre del estudiante
    if (!data.student_name || typeof data.student_name !== 'string') {
        errors.push('Nombre del estudiante es requerido');
    } else if (data.student_name.trim().length < 3) {
        errors.push('Nombre del estudiante debe tener al menos 3 caracteres');
    } else if (data.student_name.length > 100) {
        errors.push('Nombre del estudiante no puede exceder 100 caracteres');
    }

    // Validar fecha de nacimiento
    if (!data.birth_date) {
        errors.push('Fecha de nacimiento es requerida');
    } else {
        const birthDate = new Date(data.birth_date);
        if (isNaN(birthDate.getTime())) {
            errors.push('Fecha de nacimiento inválida');
        } else {
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 3 || age > 18) {
                errors.push('La edad debe estar entre 3 y 18 años');
            }
        }
    }

    // Validar grupo
    const validGroups = [
        'infantil_3a', 'infantil_4a', 'infantil_5a',
        'primaria_1', 'primaria_2', 'primaria_3', 'primaria_4', 'primaria_5', 'primaria_6',
        'eso_1', 'eso_2', 'eso_3', 'eso_4'
    ];
    if (!data.group || !validGroups.includes(data.group)) {
        errors.push('Grupo inválido');
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Email inválido');
    }

    // Validar teléfonos (si están presentes)
    const phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
    if (data.guardian1_mobile && !phoneRegex.test(data.guardian1_mobile.replace(/\s/g, ''))) {
        errors.push('Teléfono móvil del tutor 1 inválido (formato español esperado)');
    }
    if (data.guardian2_mobile && !phoneRegex.test(data.guardian2_mobile.replace(/\s/g, ''))) {
        errors.push('Teléfono móvil del tutor 2 inválido (formato español esperado)');
    }

    // Validar autorización
    if (!data.authorization || !['authorize', 'not_authorize'].includes(data.authorization)) {
        errors.push('Autorización es requerida');
    }

    return errors;
}

/**
 * Sanitiza los datos para prevenir XSS
 * @param {Object} data - Datos a sanitizar
 * @returns {Object} Datos sanitizados
 */
function sanitizeHealthData(data) {
    const sanitized = {};

    for (const key in data) {
        if (typeof data[key] === 'string') {
            // Eliminar scripts y código malicioso
            sanitized[key] = data[key]
                .trim()
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        } else if (Array.isArray(data[key])) {
            sanitized[key] = data[key].map(item =>
                typeof item === 'string' ? item.trim() : item
            );
        } else {
            sanitized[key] = data[key];
        }
    }

    return sanitized;
}

// ============================================
// CLOUD FUNCTION: CREAR FICHA DE SALUD
// ============================================

exports.createHealthRecord = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Debes estar autenticado para crear una ficha'
        );
    }

    // Validar datos
    const errors = validateHealthData(data);
    if (errors.length > 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Datos inválidos: ' + errors.join(', ')
        );
    }

    // Sanitizar datos
    const sanitizedData = sanitizeHealthData(data);

    // Verificar duplicados
    const studentNameLower = sanitizedData.student_name.toLowerCase().trim();
    const existingQuery = await admin.firestore()
        .collection('artifacts')
        .doc(data.appId || 'default')
        .collection('public/data/health_questionnaires')
        .where('student_name_lower', '==', studentNameLower)
        .where('birth_date', '==', sanitizedData.birth_date)
        .where('school_year', '==', sanitizedData.school_year)
        .get();

    if (!existingQuery.empty) {
        throw new functions.https.HttpsError(
            'already-exists',
            'Ya existe una ficha para este estudiante en este curso escolar'
        );
    }

    // Crear documento
    try {
        const docRef = await admin.firestore()
            .collection('artifacts')
            .doc(data.appId || 'default')
            .collection('public/data/health_questionnaires')
            .add({
                ...sanitizedData,
                student_name_lower: studentNameLower,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                createdBy: context.auth.uid,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

        // Log de auditoría
        await admin.firestore()
            .collection('audit_logs')
            .add({
                action: 'create_health_record',
                documentId: docRef.id,
                userId: context.auth.uid,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                studentName: sanitizedData.student_name
            });

        return {
            success: true,
            id: docRef.id,
            message: 'Ficha creada correctamente'
        };
    } catch (error) {
        console.error('Error creating health record:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Error al crear la ficha: ' + error.message
        );
    }
});

// ============================================
// CLOUD FUNCTION: ACTUALIZAR FICHA DE SALUD
// ============================================

exports.updateHealthRecord = functions.https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Debes estar autenticado'
        );
    }

    // Verificar que sea admin
    const token = await admin.auth().getUser(context.auth.uid);
    if (!token.customClaims || !token.customClaims.admin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Solo administradores pueden actualizar fichas'
        );
    }

    const { documentId, ...updateData } = data;

    if (!documentId) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'ID de documento es requerido'
        );
    }

    // Validar datos
    const errors = validateHealthData(updateData);
    if (errors.length > 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Datos inválidos: ' + errors.join(', ')
        );
    }

    // Sanitizar datos
    const sanitizedData = sanitizeHealthData(updateData);

    try {
        await admin.firestore()
            .collection('artifacts')
            .doc(data.appId || 'default')
            .collection('public/data/health_questionnaires')
            .doc(documentId)
            .update({
                ...sanitizedData,
                student_name_lower: sanitizedData.student_name.toLowerCase().trim(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedBy: context.auth.uid
            });

        // Log de auditoría
        await admin.firestore()
            .collection('audit_logs')
            .add({
                action: 'update_health_record',
                documentId: documentId,
                userId: context.auth.uid,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

        return {
            success: true,
            message: 'Ficha actualizada correctamente'
        };
    } catch (error) {
        console.error('Error updating health record:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Error al actualizar la ficha: ' + error.message
        );
    }
});

// ============================================
// CLOUD FUNCTION: ASIGNAR ROL DE ADMIN
// ============================================

exports.setAdminRole = functions.https.onCall(async (data, context) => {
    // Verificar que el usuario que llama sea super admin
    if (!context.auth || !context.auth.token.superAdmin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Solo super admins pueden asignar roles'
        );
    }

    const { uid, role } = data;

    if (!uid || !role) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'UID y rol son requeridos'
        );
    }

    try {
        await admin.auth().setCustomUserClaims(uid, { [role]: true });

        // Log de auditoría
        await admin.firestore()
            .collection('audit_logs')
            .add({
                action: 'set_admin_role',
                targetUserId: uid,
                role: role,
                userId: context.auth.uid,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

        return {
            success: true,
            message: `Rol ${role} asignado correctamente`
        };
    } catch (error) {
        console.error('Error setting admin role:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Error al asignar rol: ' + error.message
        );
    }
});

// ============================================
// CLOUD FUNCTION: RATE LIMITING
// ============================================

exports.checkRateLimit = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Debes estar autenticado'
        );
    }

    const userId = context.auth.uid;
    const now = admin.firestore.Timestamp.now();
    const oneHourAgo = new admin.firestore.Timestamp(
        now.seconds - 3600,
        now.nanoseconds
    );

    // Contar acciones en la última hora
    const recentActions = await admin.firestore()
        .collection('audit_logs')
        .where('userId', '==', userId)
        .where('timestamp', '>', oneHourAgo)
        .get();

    const actionCount = recentActions.size;
    const maxActions = 50; // Máximo 50 acciones por hora

    if (actionCount >= maxActions) {
        throw new functions.https.HttpsError(
            'resource-exhausted',
            'Has excedido el límite de acciones. Intenta más tarde.'
        );
    }

    return {
        allowed: true,
        remaining: maxActions - actionCount
    };
});
