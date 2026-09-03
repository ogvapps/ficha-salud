# 🔒 Guía de Seguridad
## Aplicación Ficha de Salud

---

## ⚠️ Vulnerabilidades Críticas Identificadas

### 1. Exposición de Credenciales de Firebase

**Severidad:** 🔴 CRÍTICA

**Problema Actual:**
```javascript
// ❌ EXPUESTO en index.html (líneas 659-666)
const userFirebaseConfig = {
  apiKey: "AIzaSyBTQEwU8Aee2REe3HF6MSs40EkwiWxnei0",
  authDomain: "cuestionario-salud-colegio.firebaseapp.com",
  projectId: "cuestionario-salud-colegio",
  storageBucket: "cuestionario-salud-colegio.firebasestorage.app",
  messagingSenderId: "349448348069",
  appId: "1:349448348069:web:5ea6091d56747124fd084c"
};
```

**Riesgo:**
- Cualquiera puede ver estas credenciales en el código fuente
- Pueden usar tu proyecto Firebase sin autorización
- Posible abuso de cuota gratuita
- Acceso no autorizado a datos

**Solución Recomendada:**

1. **Configurar Reglas de Firestore Restrictivas**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Denegar todo por defecto
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Permitir lectura solo a usuarios autenticados
    match /artifacts/{appId}/public/data/health_questionnaires/{document} {
      allow read: if request.auth != null;
      
      // Solo admins pueden escribir
      allow create, update: if request.auth != null && 
                               request.auth.token.admin == true;
      
      // Solo admins pueden borrar
      allow delete: if request.auth != null && 
                       request.auth.token.admin == true;
    }
  }
}
```

2. **Configurar App Check (Recomendado)**
```javascript
// En Firebase Console:
// 1. Ir a Build > App Check
// 2. Registrar tu app
// 3. Configurar reCAPTCHA v3 para web

// En tu código:
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
  isTokenAutoRefreshEnabled: true
});
```

3. **Limitar Dominios Autorizados**
```
En Firebase Console:
Settings > General > Your apps > Web app
Authorized domains: solo tu dominio de producción
```

---

### 2. Autenticación Anónima Insegura

**Severidad:** 🟡 ALTA

**Problema Actual:**
```javascript
// ❌ Cualquiera puede autenticarse anónimamente (línea 680)
await auth.signInAnonymously();
```

**Riesgo:**
- Usuarios no verificados pueden acceder
- No hay control de quién usa la aplicación
- Difícil rastrear actividad maliciosa

**Solución Recomendada:**

1. **Implementar Autenticación por Email**
```javascript
// Para usuarios regulares
async function signInUser(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Para admins (ya implementado)
async function signInAdmin(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdTokenResult();
    
    if (token.claims.admin) {
      return { success: true, user: userCredential.user };
    } else {
      await auth.signOut();
      return { success: false, error: 'No tienes permisos de administrador' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

2. **Configurar Claims Personalizados**
```javascript
// Cloud Function para asignar rol de admin
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario que llama es super admin
  if (!context.auth || !context.auth.token.superAdmin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Solo super admins pueden asignar roles'
    );
  }

  const uid = data.uid;
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  
  return { success: true };
});
```

---

### 3. Validación Insuficiente de Datos

**Severidad:** 🟡 ALTA

**Problema Actual:**
- No hay validación del lado del servidor
- Datos del formulario se guardan directamente
- Posible inyección de código malicioso

**Solución Recomendada:**

1. **Validación con Cloud Functions**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.createHealthRecord = functions.https.onCall(async (data, context) => {
  // Verificar autenticación
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Debes estar autenticado'
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

  // Guardar en Firestore
  const docRef = await admin.firestore()
    .collection('health_questionnaires')
    .add({
      ...sanitizedData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: context.auth.uid
    });

  return { success: true, id: docRef.id };
});

function validateHealthData(data) {
  const errors = [];

  // Validar nombre
  if (!data.student_name || data.student_name.trim().length < 3) {
    errors.push('Nombre inválido');
  }

  // Validar fecha de nacimiento
  const birthDate = new Date(data.birth_date);
  if (isNaN(birthDate.getTime())) {
    errors.push('Fecha de nacimiento inválida');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    errors.push('Email inválido');
  }

  // Validar teléfonos
  const phoneRegex = /^\+?[\d\s-()]+$/;
  if (data.guardian1_mobile && !phoneRegex.test(data.guardian1_mobile)) {
    errors.push('Teléfono 1 inválido');
  }

  return errors;
}

function sanitizeHealthData(data) {
  const sanitized = {};

  // Sanitizar strings
  for (const key in data) {
    if (typeof data[key] === 'string') {
      sanitized[key] = data[key]
        .trim()
        .replace(/<script>/gi, '')
        .replace(/<\/script>/gi, '')
        .replace(/javascript:/gi, '');
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
}
```

2. **Validación en el Cliente (Adicional)**
```javascript
// Validación mejorada en el formulario
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validatePhone(phone) {
  const regex = /^(\+34|0034|34)?[6789]\d{8}$/;  // Formato español
  return regex.test(phone.replace(/\s/g, ''));
}

function validateBirthDate(date) {
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  // Debe tener entre 3 y 18 años
  return age >= 3 && age <= 18;
}
```

---

### 4. Exposición de Datos Sensibles

**Severidad:** 🟡 ALTA

**Problema Actual:**
- Datos médicos sensibles sin encriptación adicional
- Exportación a Excel sin control de acceso
- Logs con información personal

**Solución Recomendada:**

1. **Encriptación de Datos Sensibles**
```javascript
const crypto = require('crypto');

// Encriptar datos sensibles antes de guardar
function encryptSensitiveData(data, key) {
  const algorithm = 'aes-256-gcm';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

// Desencriptar al leer
function decryptSensitiveData(encryptedData, key) {
  const algorithm = 'aes-256-gcm';
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return JSON.parse(decrypted);
}
```

2. **Control de Acceso para Exportación**
```javascript
// Solo admins pueden exportar
async function exportData() {
  const user = auth.currentUser;
  if (!user) {
    showError('Debes iniciar sesión');
    return;
  }

  const token = await user.getIdTokenResult();
  if (!token.claims.admin) {
    showError('No tienes permisos para exportar');
    return;
  }

  // Proceder con exportación
  // ...
}
```

3. **Logging Seguro**
```javascript
// ❌ MAL - Loggear datos sensibles
console.log('Saving student:', data);

// ✅ BIEN - Loggear solo información necesaria
console.log('Saving student:', {
  id: data.id,
  group: data.group,
  timestamp: new Date().toISOString()
});
```

---

### 5. Sin Rate Limiting

**Severidad:** 🟠 MEDIA

**Problema Actual:**
- No hay límite de peticiones
- Posible abuso de recursos
- Ataques de fuerza bruta

**Solución Recomendada:**

1. **Firebase App Check + reCAPTCHA**
```javascript
// Ya mencionado arriba
```

2. **Rate Limiting en Cloud Functions**
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Limitar a 10 peticiones por minuto por IP
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // 10 peticiones
  message: 'Demasiadas peticiones, intenta más tarde'
});

exports.createHealthRecord = functions.https.onRequest((req, res) => {
  limiter(req, res, () => {
    // Tu lógica aquí
  });
});
```

---

## 🛡️ Checklist de Seguridad

### Inmediato (Hacer HOY)
- [ ] Configurar reglas de Firestore restrictivas
- [ ] Limitar dominios autorizados en Firebase Console
- [ ] Revisar permisos de usuarios existentes
- [ ] Eliminar console.logs con datos sensibles

### Corto Plazo (Esta Semana)
- [ ] Implementar App Check con reCAPTCHA
- [ ] Crear Cloud Functions para validación
- [ ] Configurar custom claims para admins
- [ ] Implementar logging seguro

### Medio Plazo (Este Mes)
- [ ] Encriptar datos sensibles
- [ ] Implementar rate limiting
- [ ] Auditoría de seguridad completa
- [ ] Documentar procedimientos de seguridad

### Largo Plazo (Próximos 3 Meses)
- [ ] Penetration testing
- [ ] Implementar 2FA para admins
- [ ] Backup y recuperación de datos
- [ ] Plan de respuesta a incidentes

---

## 📋 Reglas de Firestore Recomendadas

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && request.auth.token.admin == true;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Health questionnaires
    match /artifacts/{appId}/public/data/health_questionnaires/{document} {
      // Lectura: solo usuarios autenticados
      allow read: if isSignedIn();
      
      // Creación: usuarios autenticados (se puede restringir más)
      allow create: if isSignedIn() && 
                       validateHealthData(request.resource.data);
      
      // Actualización y borrado: solo admins
      allow update, delete: if isAdmin();
    }
    
    // Función de validación
    function validateHealthData(data) {
      return data.student_name is string &&
             data.student_name.size() >= 3 &&
             data.birth_date is string &&
             data.group is string &&
             data.email is string &&
             data.email.matches('^[^@]+@[^@]+\\.[^@]+$');
    }
  }
}
```

---

## 🔐 Configuración de Firebase Authentication

### Métodos de Autenticación Recomendados

1. **Email/Password** ✅ (Ya implementado para admins)
2. **Google Sign-In** ✅ (Recomendado para usuarios)
3. **Anonymous** ❌ (Desactivar o restringir)

### Configuración en Firebase Console

```
1. Authentication > Sign-in method
2. Habilitar Email/Password
3. Habilitar Google
4. Desactivar Anonymous (o restringir con reglas)

5. Settings > Authorized domains
   - Solo tu dominio de producción
   - localhost (solo para desarrollo)

6. Templates > Email templates
   - Personalizar emails de verificación
   - Personalizar emails de recuperación
```

---

## 🚨 Plan de Respuesta a Incidentes

### Si Detectas Acceso No Autorizado

1. **Inmediato (0-1 hora)**
   - Desactivar autenticación anónima
   - Cambiar reglas de Firestore a solo lectura
   - Revisar logs de actividad

2. **Corto Plazo (1-24 horas)**
   - Identificar datos comprometidos
   - Notificar a usuarios afectados
   - Cambiar credenciales si es necesario

3. **Seguimiento (1-7 días)**
   - Investigar causa raíz
   - Implementar medidas correctivas
   - Documentar incidente
   - Actualizar procedimientos

---

## 📞 Contactos de Emergencia

- **Desarrollador:** ogonzalezv01@educarex.es
- **Firebase Support:** https://firebase.google.com/support
- **Documentación:** https://firebase.google.com/docs/security

---

**Última actualización:** 24 de enero de 2026  
**Próxima revisión:** 24 de febrero de 2026
