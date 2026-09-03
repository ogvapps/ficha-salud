/**
 * Módulo para determinar el estado de salud de un estudiante
 * @module health-status
 */

import { HEALTH_STATUS } from './config.js';

/**
 * Determina el estado de salud basado en los datos de la ficha
 * @param {Object} data - Datos de la ficha de salud
 * @returns {Object} Estado de salud con color, nombre y razón
 */
export function getHealthStatus(data) {
    if (!data) return HEALTH_STATUS.GREEN;

    // Condiciones de RIESGO ALTO (Rojo)
    const hasRedConditions =
        (data.risk_situation && data.risk_situation.trim() !== '') ||
        data.special_care === 'yes' ||
        (Array.isArray(data.allergy_symptoms) && data.allergy_symptoms.includes('anaphylactic_shock')) ||
        (data.allergy_food_text && data.allergy_food_text.trim() !== '') ||
        data.allergy_meds_text === 'yes' ||
        hasSeriosDiseases(data.diseases);

    if (hasRedConditions) return HEALTH_STATUS.RED;

    // Condiciones de ATENCIÓN (Amarillo)
    const hasYellowConditions =
        hasAllergies(data.known_allergies) ||
        data.psych_treatment === 'yes' ||
        hasDiseases(data.diseases) ||
        data.allergy_pollen_text ||
        (Array.isArray(data.allergy_symptoms) && data.allergy_symptoms.length > 0);

    if (hasYellowConditions) return HEALTH_STATUS.YELLOW;

    // Sin condiciones significativas (Verde)
    return HEALTH_STATUS.GREEN;
}

/**
 * Verifica si tiene enfermedades serias
 * @param {string} diseases - Texto de enfermedades
 * @returns {boolean}
 */
function hasSeriosDiseases(diseases) {
    if (!diseases) return false;
    const diseasesLower = diseases.toLowerCase();
    const seriousConditions = ['diabetes', 'epilepsia', 'asma grave'];
    return seriousConditions.some(condition => diseasesLower.includes(condition));
}

/**
 * Verifica si tiene alergias
 * @param {string} allergies - Texto de alergias
 * @returns {boolean}
 */
function hasAllergies(allergies) {
    if (!allergies) return false;
    const allergiesLower = allergies.toLowerCase().trim();
    return allergiesLower !== '' && allergiesLower !== 'ninguna';
}

/**
 * Verifica si tiene enfermedades
 * @param {string} diseases - Texto de enfermedades
 * @returns {boolean}
 */
function hasDiseases(diseases) {
    if (!diseases) return false;
    const diseasesLower = diseases.toLowerCase().trim();
    return diseasesLower !== '' && diseasesLower !== 'ninguna';
}

/**
 * Formatea el valor para mostrar en la UI
 * @param {*} value - Valor a formatear
 * @returns {string}
 */
export function formatValue(value) {
    if (!value || value === '') return 'No especificado';
    if (Array.isArray(value)) return value.join(', ');

    // Mapeo de valores especiales
    const valueMap = {
        'on': 'Sí',
        'authorize': 'AUTORIZO',
        'not_authorize': 'NO AUTORIZO',
        'yes': 'Sí',
        'no': 'No'
    };

    return valueMap[value] || value;
}
