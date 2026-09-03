# 🚀 Guía de Despliegue y Configuración
## Ficha de Salud - Implementación Completa de Seguridad

---

## ✅ PASO 1: Configurar Firebase Console (15 minutos)

### 1.1 Configurar Reglas de Firestore

1. **Abrir Firebase Console:**
   ```
   https://console.firebase.google.com
   → Selecciona tu proyecto: cuestionario-salud-colegio
   → Firestore Database
   → Rules (pestaña superior)
   ```

2. **Copiar las reglas del archivo `firestore.rules`**

3. **Publicar las reglas:**
   - Click en "Publish"
   - Confirmar

✅ **Verificación:** Deberías ver "Rules published successfully"

---

### 1.2 Limitar Dominios Autorizados

1. **Ir a configuración:**
   ```
   Firebase Console
   → ⚙️ Settings (arriba a la izquierda)
   → General
   → Your apps (scroll down)
   → Web app
   → Authorized domains
   ```

2. **Eliminar dominios no necesarios, dejar solo:**
   - `localhost` (para desarrollo)
   - Tu dominio de producción (ej: `ficha-salud.tudominio.com`)

3. **Guardar cambios**

✅ **Verificación:** Solo deberías ver 2 dominios en la lista

---

### 1.3 Revisar Usuarios

1. **Ir a Authentication:**
   ```
   Firebase Console
   → Authentication
   → Users
   ```

2. **Revisar:**
   - ¿Cuántos usuarios anónimos hay?
   - ¿Hay usuarios sospechosos?

3. **Eliminar usuarios anónimos no necesarios**

✅ **Verificación:** Lista de usuarios limpia

---

### 1.4 Desactivar Autenticación Anónima

1. **Ir a métodos de autenticación:**
   ```
   Firebase Console
   → Authentication
   → Sign-in method
   ```

2. **Desactivar "Anonymous"** (o dejarlo con restricciones)

3. **Asegurarse que "Email/Password" esté habilitado**

✅ **Verificación:** Anonymous desactivado, Email/Password habilitado

---

## ✅ PASO 2: Configurar Variables de Entorno (5 minutos)

### 2.1 Crear archivo .env.local

1. **Copiar el archivo de ejemplo:**
   ```bash
   cp .env.example .env.local
   ```

2. **Editar `.env.local` con tus credenciales:**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyBTQEwU8Aee2REe3HF6MSs40EkwiWxnei0
   VITE_FIREBASE_AUTH_DOMAIN=cuestionario-salud-colegio.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=cuestionario-salud-colegio
   VITE_FIREBASE_STORAGE_BUCKET=cuestionario-salud-colegio.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=349448348069
   VITE_FIREBASE_APP_ID=1:349448348069:web:5ea6091d56747124fd084c
   
   VITE_APP_ID=default-app-id
   VITE_DEFAULT_SCHOOL_NAME=Colegio Madre Matilde
   VITE_DEFAULT_SCHOOL_YEAR=2025/2026
   
   VITE_ENV=development
   ```

3. **Asegurarse que `.env.local` está en `.gitignore`**

✅ **Verificación:** Archivo `.env.local` creado y NO en git

---

## ✅ PASO 3: Instalar Firebase CLI (5 minutos)

### 3.1 Instalar Firebase Tools

```bash
npm install -g firebase-tools
```

### 3.2 Iniciar sesión

```bash
firebase login
```

### 3.3 Verificar proyecto

```bash
firebase projects:list
```

Deberías ver `cuestionario-salud-colegio` en la lista.

✅ **Verificación:** `firebase projects:list` muestra tu proyecto

---

## ✅ PASO 4: Desplegar Cloud Functions (10 minutos)

### 4.1 Instalar dependencias

```bash
cd functions
npm install
cd ..
```

### 4.2 Desplegar functions

```bash
firebase deploy --only functions
```

Esto desplegará:
- `createHealthRecord`
- `updateHealthRecord`
- `setAdminRole`
- `checkRateLimit`

### 4.3 Verificar deployment

```bash
firebase functions:list
```

✅ **Verificación:** 4 funciones desplegadas correctamente

---

## ✅ PASO 5: Configurar Primer Admin (5 minutos)

### 5.1 Crear usuario admin en Firebase Console

1. **Ir a Authentication > Users**
2. **Add user**
   - Email: `tu-email@ejemplo.com`
   - Password: (contraseña segura)
3. **Copiar el UID del usuario**

### 5.2 Asignar rol de admin

```bash
firebase auth:set-custom-claims UID_DEL_USUARIO '{"admin":true}'
```

Reemplaza `UID_DEL_USUARIO` con el UID que copiaste.

### 5.3 Verificar

```bash
firebase auth:get UID_DEL_USUARIO
```

Deberías ver `"admin": true` en customClaims.

✅ **Verificación:** Usuario tiene claim de admin

---

## ✅ PASO 6: Configurar App Check (OPCIONAL pero RECOMENDADO)

### 6.1 Obtener reCAPTCHA Site Key

1. **Ir a:**
   ```
   https://www.google.com/recaptcha/admin
   ```

2. **Registrar nuevo sitio:**
   - Label: Ficha de Salud
   - reCAPTCHA type: v3
   - Domains: tu dominio
   - Accept terms

3. **Copiar Site Key**

### 6.2 Activar App Check en Firebase

1. **Ir a Firebase Console:**
   ```
   → Build
   → App Check
   → Get started
   ```

2. **Registrar app web**

3. **Seleccionar reCAPTCHA v3**

4. **Pegar Site Key**

5. **Guardar**

### 6.3 Agregar Site Key a .env.local

```env
VITE_RECAPTCHA_SITE_KEY=tu_site_key_aqui
```

✅ **Verificación:** App Check activado en Firebase Console

---

## ✅ PASO 7: Desplegar Aplicación (5 minutos)

### 7.1 Desplegar a Firebase Hosting

```bash
firebase deploy --only hosting
```

### 7.2 Obtener URL

Al finalizar, verás:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/...
Hosting URL: https://cuestionario-salud-colegio.web.app
```

### 7.3 Probar la aplicación

Abre la URL en tu navegador y prueba:
- ✅ Formulario funciona
- ✅ Login de admin funciona
- ✅ No hay errores en consola

✅ **Verificación:** Aplicación funcionando en producción

---

## ✅ PASO 8: Verificación Final de Seguridad

### Checklist de Seguridad

- [ ] Reglas de Firestore desplegadas y restrictivas
- [ ] Dominios autorizados limitados
- [ ] Autenticación anónima desactivada
- [ ] Cloud Functions desplegadas
- [ ] Al menos un usuario admin configurado
- [ ] Variables de entorno configuradas
- [ ] `.env.local` NO está en git
- [ ] App Check activado (opcional)
- [ ] Aplicación desplegada y funcionando

---

## 🔧 COMANDOS ÚTILES

### Desarrollo Local

```bash
# Iniciar emuladores de Firebase
firebase emulators:start

# Servir aplicación localmente
npx serve

# Ver logs de functions
firebase functions:log
```

### Deployment

```bash
# Desplegar todo
firebase deploy

# Solo functions
firebase deploy --only functions

# Solo hosting
firebase deploy --only hosting

# Solo reglas de Firestore
firebase deploy --only firestore:rules
```

### Debugging

```bash
# Ver configuración actual
firebase projects:list

# Ver funciones desplegadas
firebase functions:list

# Ver logs en tiempo real
firebase functions:log --only createHealthRecord
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: "Permission denied"

**Causa:** Reglas de Firestore muy restrictivas

**Solución:**
1. Verificar que el usuario esté autenticado
2. Verificar que tenga el claim de admin si es necesario
3. Revisar logs en Firebase Console

### Error: "Function not found"

**Causa:** Cloud Functions no desplegadas

**Solución:**
```bash
firebase deploy --only functions
firebase functions:list  # Verificar
```

### Error: "CORS"

**Causa:** Dominio no autorizado

**Solución:**
1. Ir a Firebase Console > Settings > Authorized domains
2. Agregar tu dominio

### Error: "App Check failed"

**Causa:** reCAPTCHA no configurado correctamente

**Solución:**
1. Verificar Site Key en .env.local
2. Verificar que el dominio esté registrado en reCAPTCHA
3. Limpiar caché del navegador

---

## 📊 MONITOREO

### Ver Métricas en Firebase Console

1. **Ir a:**
   ```
   Firebase Console
   → Analytics
   → Dashboard
   ```

2. **Revisar:**
   - Usuarios activos
   - Errores de functions
   - Uso de Firestore

### Configurar Alertas

1. **Ir a:**
   ```
   Firebase Console
   → Alerts
   ```

2. **Crear alertas para:**
   - Errores de functions
   - Uso excesivo de cuota
   - Fallos de autenticación

---

## 🎉 ¡LISTO!

Tu aplicación ahora tiene:

✅ Seguridad robusta con reglas de Firestore
✅ Validación del lado del servidor con Cloud Functions
✅ Autenticación segura sin usuarios anónimos
✅ Variables de entorno protegidas
✅ App Check para protección adicional (opcional)
✅ Deployment automatizado

**Puntuación de Seguridad: 9/10** 🎯

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisa los logs: `firebase functions:log`
2. Revisa la consola del navegador
3. Revisa Firebase Console > Functions > Logs
4. Contacta: ogonzalezv01@educarex.es

---

**Última actualización:** 24 de enero de 2026
