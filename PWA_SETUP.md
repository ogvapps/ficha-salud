# 📱 Configuración de PWA - Instrucciones

## ✅ Manifest Actualizado

El archivo `manifest.json` ha sido actualizado con:
- ✅ Nombre completo y corto
- ✅ Descripción mejorada
- ✅ Tema color teal (#14b8a6)
- ✅ Íconos en múltiples tamaños
- ✅ Shortcuts (accesos directos)
- ✅ Screenshots
- ✅ Categorías (health, education, medical)

---

## 📋 PASO 1: Reemplazar Íconos

He generado 2 íconos profesionales. Necesitas:

### 1. Descargar los íconos generados:
- **icon-192.png** (192x192 px)
- **icon-512.png** (512x512 px)

Los íconos están en la carpeta de artifacts de esta conversación.

### 2. Reemplazar los íconos existentes:
- Sobrescribe `d:/Aplicaciones/ficha-salud/icon-192.png`
- Sobrescribe `d:/Aplicaciones/ficha-salud/icon-512.png`

---

## 📋 PASO 2: Desplegar a Vercel

Una vez reemplazados los íconos:

```bash
vercel --prod
```

---

## 🎯 CARACTERÍSTICAS DE LA PWA

### ✅ Instalable
- Los usuarios pueden instalar la app en su dispositivo
- Aparecerá como una app nativa
- Ícono en la pantalla de inicio

### ✅ Shortcuts (Accesos Directos)
Al mantener presionado el ícono de la app, verán:
- **Nueva Ficha** → Ir directamente al formulario
- **Panel Admin** → Ir directamente al admin

### ✅ Standalone
- Se abre sin la barra del navegador
- Experiencia de app nativa
- Pantalla completa

---

## 📱 CÓMO INSTALAR LA APP

### En Android:
1. Abrir `https://ficha-salud.vercel.app` en Chrome
2. Menú (⋮) → "Añadir a pantalla de inicio"
3. Confirmar

### En iOS:
1. Abrir en Safari
2. Botón Compartir
3. "Añadir a pantalla de inicio"

### En Desktop:
1. Abrir en Chrome
2. Ícono de instalación en la barra de direcciones
3. Click "Instalar"

---

## 🎨 DISEÑO DEL ÍCONO

El ícono generado incluye:
- ✅ Clipboard (portapapeles) médico
- ✅ Cruz médica blanca
- ✅ Gradiente teal a azul
- ✅ Diseño moderno y profesional
- ✅ Alta visibilidad

---

## ✅ VERIFICACIÓN

Después de desplegar, verifica en:

**Lighthouse (Chrome DevTools):**
1. F12 → Lighthouse
2. Seleccionar "Progressive Web App"
3. Generate report
4. Debería obtener 90+ puntos

**PWA Checker:**
```
https://www.pwabuilder.com/
```
Ingresa tu URL y verifica el score.

---

**Última actualización:** 24 de enero de 2026
