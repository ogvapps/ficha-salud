# 📘 Guía de Mejores Prácticas
## Aplicación Ficha de Salud

---

## 🎨 Estilo de Código

### JavaScript

#### Nomenclatura
```javascript
// ✅ BIEN - camelCase para variables y funciones
const studentName = 'Juan Pérez';
function getHealthStatus(data) { }

// ✅ BIEN - PascalCase para clases
class FormStepper { }
class ExcelExporter { }

// ✅ BIEN - UPPER_SNAKE_CASE para constantes
const MAX_STUDENTS = 100;
const DEFAULT_SCHOOL_NAME = 'Colegio Madre Matilde';

// ❌ MAL
const StudentName = 'Juan';  // No usar PascalCase para variables
function GetHealthStatus() { }  // No usar PascalCase para funciones
```

#### Funciones
```javascript
// ✅ BIEN - Funciones pequeñas con una sola responsabilidad
function hasSeriosDiseases(diseases) {
  if (!diseases) return false;
  const diseasesLower = diseases.toLowerCase();
  return ['diabetes', 'epilepsia', 'asma grave']
    .some(condition => diseasesLower.includes(condition));
}

// ❌ MAL - Función que hace demasiadas cosas
function processStudent(data) {
  // Validar
  // Guardar
  // Enviar email
  // Actualizar UI
  // ...
}
```

#### Async/Await
```javascript
// ✅ BIEN - Usar async/await con try-catch
async function saveStudent(data) {
  try {
    const docRef = await db.collection('students').add(data);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving student:', error);
    return { success: false, error: error.message };
  }
}

// ❌ MAL - Promises sin manejo de errores
function saveStudent(data) {
  return db.collection('students').add(data);
}
```

#### Comentarios
```javascript
// ✅ BIEN - JSDoc para funciones públicas
/**
 * Determina el estado de salud basado en los datos de la ficha
 * @param {Object} data - Datos de la ficha de salud
 * @returns {Object} Estado de salud con color, nombre y razón
 */
export function getHealthStatus(data) {
  // ...
}

// ✅ BIEN - Comentarios explicativos para lógica compleja
// Verificar condiciones de alto riesgo (Rojo)
// Incluye: shock anafiláctico, diabetes, epilepsia, etc.
const hasRedConditions = /* ... */;

// ❌ MAL - Comentarios obvios
const name = 'Juan';  // Asignar nombre
```

---

## 🏗️ Arquitectura

### Separación de Responsabilidades

```javascript
// ✅ BIEN - Módulos separados por funcionalidad
// config.js - Configuración
// firebase-service.js - Servicios de Firebase
// ui-manager.js - Gestión de UI
// form-stepper.js - Lógica del formulario

// ❌ MAL - Todo en un solo archivo
// index.html con 1500+ líneas de JavaScript
```

### Inyección de Dependencias

```javascript
// ✅ BIEN - Pasar dependencias como parámetros
class ExcelExporter {
  constructor(dbCollectionRef, schoolNameInput, schoolYearInput) {
    this.dbCollectionRef = dbCollectionRef;
    this.schoolNameInput = schoolNameInput;
    this.schoolYearInput = schoolYearInput;
  }
}

// ❌ MAL - Acceder a variables globales
class ExcelExporter {
  export() {
    const data = window.globalData;  // ❌
  }
}
```

---

## 🔒 Seguridad

### Validación de Datos

```javascript
// ✅ BIEN - Validar y sanitizar datos
function sanitizeInput(input) {
  return input.trim().replace(/<script>/gi, '');
}

const studentName = sanitizeInput(form.student_name.value);

// ❌ MAL - Confiar en datos del cliente
const studentName = form.student_name.value;
await db.collection('students').add({ name: studentName });
```

### Configuración Sensible

```javascript
// ✅ BIEN - Variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ...
};

// ❌ MAL - Hardcodear credenciales
const firebaseConfig = {
  apiKey: "AIzaSyBTQEwU8Aee2REe3HF6MSs40EkwiWxnei0",
  // ...
};
```

### Reglas de Firestore

```javascript
// ✅ BIEN - Reglas restrictivas
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /health_questionnaires/{document} {
      // Solo lectura para usuarios autenticados
      allow read: if request.auth != null;
      // Solo escritura para admins
      allow write: if request.auth.token.admin == true;
    }
  }
}

// ❌ MAL - Reglas permisivas
allow read, write: if true;  // ¡NUNCA hacer esto!
```

---

## ⚡ Rendimiento

### Queries Optimizadas

```javascript
// ✅ BIEN - Limitar resultados y usar índices
const query = db.collection('students')
  .where('group', '==', 'primaria_1')
  .orderBy('createdAt', 'desc')
  .limit(50);

// ❌ MAL - Traer todos los documentos
const query = db.collection('students');
const allDocs = await query.get();  // Puede ser miles de documentos
```

### Debouncing

```javascript
// ✅ BIEN - Debounce para búsquedas
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const debouncedSearch = debounce(searchStudents, 300);
searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// ❌ MAL - Ejecutar búsqueda en cada tecla
searchInput.addEventListener('input', (e) => {
  searchStudents(e.target.value);  // Se ejecuta demasiadas veces
});
```

### Lazy Loading

```javascript
// ✅ BIEN - Cargar datos bajo demanda
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMoreData();
    }
  });
});

observer.observe(loadMoreTrigger);

// ❌ MAL - Cargar todo al inicio
const allStudents = await db.collection('students').get();
```

---

## 🎯 Manejo de Errores

### Try-Catch Apropiado

```javascript
// ✅ BIEN - Manejo específico de errores
async function saveStudent(data) {
  try {
    await db.collection('students').add(data);
    showSuccessMessage('Estudiante guardado correctamente');
  } catch (error) {
    if (error.code === 'permission-denied') {
      showErrorMessage('No tienes permisos para guardar');
    } else if (error.code === 'unavailable') {
      showErrorMessage('Servicio no disponible. Intenta más tarde');
    } else {
      showErrorMessage('Error al guardar: ' + error.message);
    }
    console.error('Error saving student:', error);
  }
}

// ❌ MAL - Ignorar errores
async function saveStudent(data) {
  try {
    await db.collection('students').add(data);
  } catch (error) {
    // Silenciar error
  }
}
```

### Logging Estructurado

```javascript
// ✅ BIEN - Logging con contexto
console.log('Saving student:', {
  name: data.student_name,
  group: data.group,
  timestamp: new Date().toISOString()
});

// ❌ MAL - Logging sin contexto
console.log('Saving...');
```

---

## ♿ Accesibilidad

### Etiquetas ARIA

```html
<!-- ✅ BIEN - Etiquetas ARIA apropiadas -->
<button 
  aria-label="Eliminar estudiante Juan Pérez"
  aria-describedby="delete-warning"
  class="delete-btn">
  <svg aria-hidden="true">...</svg>
</button>
<p id="delete-warning" class="sr-only">
  Esta acción no se puede deshacer
</p>

<!-- ❌ MAL - Sin etiquetas ARIA -->
<button class="delete-btn">
  <svg>...</svg>
</button>
```

### Indicadores de Estado

```html
<!-- ✅ BIEN - Indicador de carga accesible -->
<div role="status" aria-live="polite" aria-atomic="true">
  <span class="sr-only">Cargando datos...</span>
  <div class="spinner" aria-hidden="true"></div>
</div>

<!-- ❌ MAL - Solo visual -->
<div class="spinner"></div>
```

### Navegación por Teclado

```javascript
// ✅ BIEN - Soporte para teclado
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Asegurar que elementos interactivos sean focusables
<button tabindex="0">Acción</button>

// ❌ MAL - Solo funciona con mouse
<div onclick="doSomething()">Click me</div>
```

---

## 🧪 Testing

### Unit Tests

```javascript
// ✅ BIEN - Tests unitarios para funciones puras
import { getHealthStatus } from './health-status.js';

describe('getHealthStatus', () => {
  test('should return RED for diabetes', () => {
    const data = { diseases: 'diabetes' };
    expect(getHealthStatus(data).name).toBe('Rojo');
  });

  test('should return GREEN for no conditions', () => {
    const data = {};
    expect(getHealthStatus(data).name).toBe('Verde');
  });
});
```

### Integration Tests

```javascript
// ✅ BIEN - Tests de integración para flujos completos
describe('Student Form Submission', () => {
  test('should save student and show success message', async () => {
    // Arrange
    const formData = { student_name: 'Juan', /* ... */ };
    
    // Act
    await submitForm(formData);
    
    // Assert
    expect(successModal).toBeVisible();
    expect(db.collection('students').doc).toHaveBeenCalled();
  });
});
```

---

## 📱 Responsive Design

### Mobile First

```css
/* ✅ BIEN - Mobile first */
.container {
  padding: 1rem;
}

@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}

/* ❌ MAL - Desktop first */
.container {
  padding: 2rem;
}

@media (max-width: 767px) {
  .container {
    padding: 1rem;
  }
}
```

### Touch Targets

```css
/* ✅ BIEN - Tamaño mínimo de 44x44px para touch */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* ❌ MAL - Muy pequeño para touch */
.button {
  padding: 4px 8px;
}
```

---

## 🚀 Deployment

### Build Process

```json
// ✅ BIEN - Scripts de build
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "lint": "eslint src/"
  }
}
```

### Environment Variables

```bash
# ✅ BIEN - .env.example (commitear)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_domain_here

# .env.local (NO commitear)
VITE_FIREBASE_API_KEY=AIzaSyBTQEwU8Aee2REe3HF6MSs40EkwiWxnei0
```

---

## 📚 Documentación

### README.md

```markdown
# Ficha de Salud

## Instalación
\`\`\`bash
npm install
\`\`\`

## Desarrollo
\`\`\`bash
npm run dev
\`\`\`

## Build
\`\`\`bash
npm run build
\`\`\`

## Testing
\`\`\`bash
npm test
\`\`\`
```

### JSDoc

```javascript
/**
 * Guarda un estudiante en la base de datos
 * @param {Object} data - Datos del estudiante
 * @param {string} data.student_name - Nombre completo
 * @param {string} data.birth_date - Fecha de nacimiento (YYYY-MM-DD)
 * @param {string} data.group - Grupo/curso
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 * @throws {Error} Si los datos son inválidos
 * @example
 * const result = await saveStudent({
 *   student_name: 'Juan Pérez',
 *   birth_date: '2010-05-15',
 *   group: 'primaria_1'
 * });
 */
async function saveStudent(data) {
  // ...
}
```

---

## ✅ Checklist de Calidad

Antes de hacer commit:

- [ ] Código formateado (Prettier)
- [ ] Sin errores de linting (ESLint)
- [ ] Tests pasando
- [ ] Documentación actualizada
- [ ] Sin console.logs innecesarios
- [ ] Variables de entorno configuradas
- [ ] Accesibilidad verificada
- [ ] Responsive design verificado
- [ ] Rendimiento optimizado

---

**Última actualización:** 24 de enero de 2026  
**Mantenido por:** Orestes González Villanueva
