# 🏥 Ficha de Salud - Centro Educativo

Sistema web para gestionar fichas médicas de estudiantes con integración a Firebase.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Firebase](https://img.shields.io/badge/Firebase-9.22.0-orange.svg)

---

## 📋 Descripción

**Ficha de Salud** es una aplicación web progresiva (PWA) diseñada para centros educativos que permite:

- ✅ Recopilar información médica de estudiantes mediante un formulario multi-paso
- ✅ Gestionar fichas de salud con sistema de estados (Verde/Amarillo/Rojo)
- ✅ Administración centralizada con autenticación
- ✅ Exportación a Excel con formato profesional
- ✅ Sincronización en tiempo real con Firebase
- ✅ Funcionalidad offline (PWA)

---

## 🚀 Características

### Para Padres/Tutores
- Formulario intuitivo de 5 pasos
- Validación en tiempo real
- Guardado automático
- Detección de duplicados
- Responsive design (móvil, tablet, desktop)

### Para Administradores
- Panel de administración completo
- Filtrado por curso/grupo
- Sistema de estados de salud visual
- Exportación a Excel (vista actual o todos los cursos)
- Edición y eliminación de registros
- Visualización detallada de fichas

### Técnicas
- Progressive Web App (PWA)
- Autenticación con Firebase
- Base de datos Firestore en tiempo real
- Exportación a Excel con estilos
- Diseño responsive con Tailwind CSS
- Arquitectura modular (refactorizada)

---

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Framework CSS:** Tailwind CSS 3.x
- **Backend:** Firebase (Auth + Firestore)
- **Exportación:** SheetJS (xlsx)
- **PWA:** Service Worker + Manifest

---

## 📦 Instalación

### Opción 1: Uso Directo (Sin Build)

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/ficha-salud.git
cd ficha-salud
```

2. **Abrir index.html en un navegador**
```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve

# O simplemente abrir index.html en el navegador
```

3. **Acceder a la aplicación**
```
http://localhost:8000
```

### Opción 2: Con Módulos ES6 (Refactorizado)

1. **Instalar dependencias** (si usas un bundler)
```bash
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales de Firebase
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Build para producción**
```bash
npm run build
```

---

## ⚙️ Configuración

### Firebase

1. **Crear proyecto en Firebase Console**
   - Ir a https://console.firebase.google.com
   - Crear nuevo proyecto
   - Habilitar Authentication (Email/Password)
   - Crear base de datos Firestore

2. **Configurar reglas de Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/health_questionnaires/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

3. **Obtener credenciales**
   - Project Settings > General > Your apps
   - Copiar configuración de Firebase
   - Actualizar en `js/config.js` o variables de entorno

4. **Crear usuario administrador**
```bash
# En Firebase Console > Authentication
# Crear usuario con email/password
# Luego, en Cloud Functions o Firebase CLI:
firebase auth:set-custom-claims usuario@email.com '{"admin":true}'
```

---

## 📖 Uso

### Para Padres/Tutores

1. **Acceder a la aplicación**
2. **Completar el formulario en 5 pasos:**
   - Paso 1: Datos del alumno/a
   - Paso 2: Datos de tutores legales
   - Paso 3: Información médica (parte 1)
   - Paso 4: Alergias y cuidados especiales
   - Paso 5: Autorización y envío
3. **Enviar el formulario**
4. **Recibir confirmación**

### Para Administradores

1. **Iniciar sesión** en el panel de administrador
2. **Ver todas las fichas** o filtrar por curso
3. **Acciones disponibles:**
   - 👁️ Ver detalles completos
   - ✏️ Editar ficha
   - 🗑️ Eliminar ficha
   - 📊 Exportar a Excel (vista actual o todos los cursos)

---

## 🎨 Sistema de Estados de Salud

La aplicación clasifica automáticamente a los estudiantes en tres estados:

### 🟢 Verde - Sin Condiciones Significativas
- No se reportan enfermedades graves
- Sin alergias de riesgo
- Sin cuidados especiales

### 🟡 Amarillo - Requiere Atención
- Alergias leves (pólenes, etc.)
- Tratamiento psicológico
- Enfermedades controladas

### 🔴 Rojo - Alto Riesgo
- Enfermedades graves (diabetes, epilepsia)
- Alergias alimentarias o a medicamentos
- Riesgo de shock anafiláctico
- Cuidados especiales requeridos

---

## 📂 Estructura del Proyecto

```
ficha-salud/
├── index.html              # Aplicación principal
├── manifest.json           # Configuración PWA
├── icon-*.png              # Iconos de la app
├── js/                     # Módulos JavaScript (refactorizado)
│   ├── config.js           # Configuración y constantes
│   ├── health-status.js    # Lógica de estado de salud
│   ├── form-stepper.js     # Gestión del formulario
│   ├── excel-export.js     # Exportación a Excel
│   ├── firebase-service.js # Servicios de Firebase (TODO)
│   ├── ui-manager.js       # Gestión de UI (TODO)
│   └── main.js             # Punto de entrada (TODO)
├── docs/                   # Documentación
│   ├── REFACTORIZACION.md  # Informe de refactorización
│   ├── MEJORES_PRACTICAS.md # Guía de mejores prácticas
│   └── SEGURIDAD.md        # Guía de seguridad
└── README.md               # Este archivo
```

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:** Lee el archivo `SEGURIDAD.md` para información detallada sobre:

- Configuración de reglas de Firestore
- Autenticación y autorización
- Protección de datos sensibles
- Mejores prácticas de seguridad

### Checklist Básico de Seguridad

- [ ] Reglas de Firestore configuradas
- [ ] Dominios autorizados limitados
- [ ] App Check habilitado (recomendado)
- [ ] Usuarios admin con custom claims
- [ ] Datos sensibles encriptados
- [ ] Logs sin información personal

---

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Ejecutar tests en modo watch
npm run test:watch
```

---

## 📊 Exportación a Excel

La aplicación permite exportar datos a Excel con:

- ✅ Múltiples hojas (una por curso)
- ✅ Formato profesional con estilos
- ✅ Colores según estado de salud
- ✅ Cabeceras traducidas
- ✅ Columnas autoajustadas

### Opciones de Exportación

1. **Exportar Vista Actual:** Solo los registros visibles en la tabla
2. **Exportar Todo:** Todos los cursos en hojas separadas

---

## 🌐 PWA (Progressive Web App)

La aplicación puede instalarse como app nativa en dispositivos móviles:

1. **Android:** Chrome > Menú > "Añadir a pantalla de inicio"
2. **iOS:** Safari > Compartir > "Añadir a pantalla de inicio"
3. **Desktop:** Chrome > Menú > "Instalar Ficha de Salud"

### Funcionalidades Offline

- ✅ Caché de assets estáticos
- ✅ Funcionalidad básica sin conexión
- ⬜ Sincronización automática al reconectar (TODO)

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Contribución

- Lee `MEJORES_PRACTICAS.md` antes de contribuir
- Sigue el estilo de código existente
- Escribe tests para nuevas funcionalidades
- Actualiza la documentación

---

## 📝 Roadmap

### v1.1 (Próximo Release)
- [ ] Migración completa a módulos ES6
- [ ] Implementación de tests unitarios
- [ ] Mejoras de accesibilidad (WCAG 2.1)
- [ ] Paginación en tabla de datos

### v1.2
- [ ] Notificaciones por email
- [ ] Exportación a PDF
- [ ] Búsqueda avanzada
- [ ] Estadísticas y gráficos

### v2.0
- [ ] Migración a React/Vue
- [ ] App móvil nativa (React Native)
- [ ] API REST
- [ ] Multi-idioma

---

## 🐛 Reporte de Bugs

Si encuentras un bug, por favor:

1. Verifica que no esté ya reportado en [Issues](https://github.com/tu-usuario/ficha-salud/issues)
2. Crea un nuevo issue con:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del navegador/dispositivo

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

**Orestes González Villanueva**

- Email: ogonzalezv01@educarex.es
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

---

## 🙏 Agradecimientos

- Firebase por la infraestructura backend
- Tailwind CSS por el framework de diseño
- SheetJS por la librería de exportación a Excel
- La comunidad de código abierto

---

## 📚 Documentación Adicional

- [Informe de Refactorización](./REFACTORIZACION.md)
- [Guía de Mejores Prácticas](./MEJORES_PRACTICAS.md)
- [Guía de Seguridad](./SEGURIDAD.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 📞 Soporte

Para soporte técnico:

- Email: ogonzalezv01@educarex.es
- Issues: [GitHub Issues](https://github.com/tu-usuario/ficha-salud/issues)

---

**Desarrollado con ❤️ para centros educativos**

*Última actualización: 24 de enero de 2026*
