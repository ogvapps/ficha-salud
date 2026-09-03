/**
 * Configuración de Firebase y constantes de la aplicación
 * @module config
 */

// Configuración de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyBTQEwU8Aee2REe3HF6MSs40EkwiWxnei0",
  authDomain: "cuestionario-salud-colegio.firebaseapp.com",
  projectId: "cuestionario-salud-colegio",
  storageBucket: "cuestionario-salud-colegio.firebasestorage.app",
  messagingSenderId: "349448348069",
  appId: "1:349448348069:web:5ea6091d56747124fd084c"
};

// Constantes de la aplicación
export const APP_CONSTANTS = {
  DEFAULT_SCHOOL_NAME: 'Colegio Madre Matilde',
  DEFAULT_SCHOOL_YEAR: '2025/2026',
  TOTAL_STEPS: 5,
  COLLECTION_PATH_TEMPLATE: '/artifacts/{appId}/public/data/health_questionnaires'
};

// Traducciones de campos
export const FIELD_TRANSLATIONS = {
  'student_name': 'Nombre del Alumno/a',
  'birth_date': 'Fecha de Nacimiento',
  'group': 'Grupo',
  'email': 'Correo Electrónico',
  'school_name': 'Nombre del Centro',
  'school_year': 'Curso Escolar',
  'guardian1_name': 'Tutor/a 1: Nombre',
  'guardian1_mobile': 'Tutor/a 1: Móvil',
  'guardian1_work': 'Tutor/a 1: Trabajo',
  'guardian2_name': 'Tutor/a 2: Nombre',
  'guardian2_mobile': 'Tutor/a 2: Móvil',
  'guardian2_work': 'Tutor/a 2: Trabajo',
  'diseases': 'Enfermedades',
  'known_allergies': 'Alergias Conocidas (General)',
  'usual_treatment': 'Tratamiento Habitual',
  'risk_situation': 'Situación de Riesgo Leve',
  'notify_emergency': 'Avisar 112',
  'notify_parents': 'Avisar Tutores',
  'recommendations': 'Recomendaciones',
  'allergy_type': 'Tipos de Alergia',
  'allergy_pollen_text': 'Detalle Alergia Pólenes',
  'allergy_food_text': 'Detalle Alergia Alimentos',
  'allergy_meds_text': 'Alergia a Medicamentos (Sí/No)',
  'allergy_medication_text': 'Detalle Alergia Medicamentos',
  'allergy_symptoms': 'Síntomas de Alergia',
  'allergy_symptoms_other_text': 'Otros Síntomas de Alergia',
  'psych_treatment': 'Tratamiento Psicológico',
  'psych_problem': 'Problema Psicológico/Aprendizaje',
  'psych_treatment_details': 'Detalles Tratamiento Psicológico',
  'special_care': 'Necesita Cuidados Especiales',
  'special_care_text': 'Detalles Cuidados Especiales',
  'observations': 'Observaciones Adicionales',
  'authorization': 'Autorización',
  'submission_date': 'Fecha de Cumplimentación'
};

// Estados de salud
export const HEALTH_STATUS = {
  GREEN: { color: '#22c55e', name: 'Verde', reason: 'No se reportan condiciones significativas.' },
  YELLOW: { color: '#f59e0b', name: 'Amarillo', reason: 'Presenta condiciones que requieren atención.' },
  RED: { color: '#ef4444', name: 'Rojo', reason: 'Presenta condiciones de alto riesgo o cuidados especiales.' }
};
