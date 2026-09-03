# 🚀 Guía de Despliegue a Vercel
## Ficha de Salud

**Fecha:** 24 de enero de 2026

---

## ✅ PASO 1: Preparar el Proyecto (5 minutos)

### 1.1 Crear archivo vercel.json

Ya está creado en tu proyecto. Verifica que existe.

### 1.2 Asegurar que .gitignore está correcto

Ya está configurado para proteger archivos sensibles.

---

## ✅ PASO 2: Instalar Vercel CLI (2 minutos)

### Opción A: Instalar globalmente

```bash
npm install -g vercel
```

### Opción B: Usar npx (sin instalar)

```bash
npx vercel
```

---

## ✅ PASO 3: Iniciar Sesión en Vercel (1 minuto)

```bash
vercel login
```

Esto abrirá tu navegador para que inicies sesión con:
- GitHub
- GitLab
- Bitbucket
- Email

---

## ✅ PASO 4: Configurar Variables de Entorno (5 minutos)

### 4.1 Crear archivo .env.production

Crea un archivo `.env.production` con tus credenciales de Firebase:

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

VITE_ENV=production
```

### 4.2 NO subir .env.production a Git

Asegúrate que está en `.gitignore` (ya está configurado).

---

## ✅ PASO 5: Desplegar a Vercel (3 minutos)

### 5.1 Primer Despliegue

Desde la raíz de tu proyecto:

```bash
vercel
```

Vercel te hará algunas preguntas:

**1. Set up and deploy?**
```
? Set up and deploy "d:\Aplicaciones\ficha-salud"? [Y/n]
→ Y
```

**2. Which scope?**
```
? Which scope do you want to deploy to?
→ Selecciona tu cuenta
```

**3. Link to existing project?**
```
? Link to existing project? [y/N]
→ N (primera vez)
```

**4. Project name?**
```
? What's your project's name?
→ ficha-salud (o el nombre que prefieras)
```

**5. Directory?**
```
? In which directory is your code located?
→ ./ (presiona Enter)
```

**6. Override settings?**
```
? Want to override the settings? [y/N]
→ N
```

### 5.2 Vercel desplegará tu aplicación

Verás algo como:

```
🔗  Deployed to production. Run `vercel --prod` to overwrite later.
🔍  Inspect: https://vercel.com/tu-usuario/ficha-salud/...
✅  Production: https://ficha-salud-xxx.vercel.app
```

---

## ✅ PASO 6: Configurar Variables de Entorno en Vercel Dashboard (5 minutos)

### 6.1 Ir a Vercel Dashboard

```
https://vercel.com/tu-usuario/ficha-salud/settings/environment-variables
```

### 6.2 Agregar cada variable

Para cada variable de `.env.production`, agrégala en Vercel:

**Nombre de la Variable** | **Valor**
--- | ---
`VITE_FIREBASE_API_KEY` | `AIzaSyBTQEwU8Aee2REe3HF6MSs40EkwiWxnei0`
`VITE_FIREBASE_AUTH_DOMAIN` | `cuestionario-salud-colegio.firebaseapp.com`
`VITE_FIREBASE_PROJECT_ID` | `cuestionario-salud-colegio`
`VITE_FIREBASE_STORAGE_BUCKET` | `cuestionario-salud-colegio.firebasestorage.app`
`VITE_FIREBASE_MESSAGING_SENDER_ID` | `349448348069`
`VITE_FIREBASE_APP_ID` | `1:349448348069:web:5ea6091d56747124fd084c`
`VITE_APP_ID` | `default-app-id`
`VITE_DEFAULT_SCHOOL_NAME` | `Colegio Madre Matilde`
`VITE_DEFAULT_SCHOOL_YEAR` | `2025/2026`
`VITE_ENV` | `production`

**Para cada variable:**
1. Click "Add New"
2. Name: (nombre de la variable)
3. Value: (valor de la variable)
4. Environment: **Production** ✅
5. Click "Save"

### 6.3 Redesplegar

Después de agregar las variables:

```bash
vercel --prod
```

---

## ✅ PASO 7: Configurar Dominio en Firebase (3 minutos)

### 7.1 Copiar tu URL de Vercel

Ejemplo: `https://ficha-salud-xxx.vercel.app`

### 7.2 Agregar a Firebase Console

1. Ir a: https://console.firebase.google.com/project/cuestionario-salud-colegio/settings/general
2. Scroll a "Your apps"
3. Click en tu Web app
4. En "Authorized domains", click "Add domain"
5. Pegar: `ficha-salud-xxx.vercel.app` (sin https://)
6. Guardar

---

## ✅ PASO 8: Verificar Despliegue (2 minutos)

### 8.1 Abrir tu aplicación

```
https://ficha-salud-xxx.vercel.app
```

### 8.2 Verificar que funciona

- [ ] La página carga correctamente
- [ ] No hay errores en la consola del navegador
- [ ] El formulario se ve bien
- [ ] Puedes intentar crear una ficha (si ya configuraste admin)

---

## 🔄 PASO 9: Despliegues Futuros

### Opción A: Despliegue Manual

Cada vez que hagas cambios:

```bash
# Desarrollo (preview)
vercel

# Producción
vercel --prod
```

### Opción B: Despliegue Automático con Git

1. **Subir tu código a GitHub:**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/ficha-salud.git
git push -u origin main
```

2. **Conectar Vercel con GitHub:**

   - Ir a: https://vercel.com/new
   - Click "Import Git Repository"
   - Seleccionar tu repo
   - Vercel desplegará automáticamente en cada push

---

## 🎯 CONFIGURACIÓN OPCIONAL: Dominio Personalizado

### Si tienes un dominio propio (ej: ficha-salud.tudominio.com)

1. **En Vercel Dashboard:**
   - Settings > Domains
   - Add Domain
   - Ingresar tu dominio

2. **Configurar DNS:**
   - Vercel te dará instrucciones específicas
   - Agregar registros CNAME o A

3. **Actualizar Firebase:**
   - Agregar tu dominio personalizado a "Authorized domains"

---

## 📊 CHECKLIST DE DESPLIEGUE

- [ ] Vercel CLI instalado
- [ ] Login en Vercel completado
- [ ] Primer despliegue ejecutado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Redespliegue con variables
- [ ] Dominio agregado a Firebase
- [ ] Aplicación funcionando en Vercel
- [ ] Sin errores en consola

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: "Firebase not defined"

**Causa:** Variables de entorno no configuradas

**Solución:**
1. Verificar variables en Vercel Dashboard
2. Redesplegar: `vercel --prod`

### Error: "Permission denied"

**Causa:** Dominio no autorizado en Firebase

**Solución:**
1. Agregar dominio de Vercel a Firebase Console
2. Esperar 5 minutos para que se propague

### Error: "Module not found"

**Causa:** Dependencias no instaladas

**Solución:**
```bash
npm install
vercel --prod
```

---

## 📈 VENTAJAS DE VERCEL

✅ **Despliegue instantáneo** (30 segundos)
✅ **HTTPS automático** (SSL gratis)
✅ **CDN global** (rápido en todo el mundo)
✅ **Preview deployments** (cada push a Git)
✅ **Analytics gratis** (tráfico y rendimiento)
✅ **Dominio personalizado gratis**
✅ **Rollback fácil** (volver a versión anterior)

---

## 🎯 PRÓXIMOS PASOS

Después del despliegue:

1. [ ] Completar checklist de seguridad de Firebase
2. [ ] Crear usuario admin
3. [ ] Probar aplicación en producción
4. [ ] Configurar monitoreo
5. [ ] Compartir URL con usuarios

---

## 📞 COMANDOS ÚTILES

```bash
# Ver logs
vercel logs

# Ver lista de despliegues
vercel ls

# Eliminar despliegue
vercel rm [deployment-url]

# Ver información del proyecto
vercel inspect

# Abrir dashboard
vercel open
```

---

## 🎉 ¡LISTO!

Tu aplicación estará disponible en:
```
https://ficha-salud-xxx.vercel.app
```

Con:
- ✅ HTTPS seguro
- ✅ CDN global
- ✅ Despliegue automático
- ✅ Variables de entorno protegidas

---

**Última actualización:** 16:21 - 24/01/2026
