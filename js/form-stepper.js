/**
 * Módulo para gestión del formulario multi-paso
 * @module form-stepper
 */

import { APP_CONSTANTS } from './config.js';

/**
 * Clase para gestionar el formulario multi-paso
 */
export class FormStepper {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = APP_CONSTANTS.TOTAL_STEPS;
        this.steps = Array.from(document.querySelectorAll('.form-step'));
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.submitBtn = document.getElementById('submitBtn');
        this.progressBarSteps = document.querySelectorAll('.progress-bar-step');
        this.progressLine = document.getElementById('progress-line');

        this.init();
    }

    /**
     * Inicializa el stepper
     */
    init() {
        this.attachEventListeners();
        this.showStep(1);
    }

    /**
     * Adjunta event listeners a los botones
     */
    attachEventListeners() {
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.handleNext());
        }

        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.handlePrevious());
        }
    }

    /**
     * Maneja el botón "Siguiente"
     */
    handleNext() {
        if (this.validateStep(this.currentStep) && this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    }

    /**
     * Maneja el botón "Anterior"
     */
    handlePrevious() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    /**
     * Muestra un paso específico
     * @param {number} stepNumber - Número del paso a mostrar
     */
    showStep(stepNumber) {
        // Ocultar todos los pasos
        this.steps.forEach(step => step.classList.remove('active'));

        // Mostrar el paso actual
        const stepEl = document.getElementById(`step-${stepNumber}`);
        if (stepEl) stepEl.classList.add('active');

        this.currentStep = stepNumber;
        this.updateButtonsVisibility();
        this.updateProgressBar();
    }

    /**
     * Actualiza la visibilidad de los botones
     */
    updateButtonsVisibility() {
        if (this.prevBtn) {
            this.prevBtn.classList.toggle('hidden', this.currentStep === 1);
            this.prevBtn.classList.toggle('flex', this.currentStep !== 1);
        }

        if (this.nextBtn) {
            this.nextBtn.classList.toggle('hidden', this.currentStep === this.totalSteps);
            this.nextBtn.classList.toggle('flex', this.currentStep !== this.totalSteps);
        }

        if (this.submitBtn) {
            this.submitBtn.classList.toggle('hidden', this.currentStep !== this.totalSteps);
            this.submitBtn.classList.toggle('flex', this.currentStep === this.totalSteps);
        }
    }

    /**
     * Actualiza la barra de progreso
     */
    updateProgressBar() {
        this.progressBarSteps.forEach(step => {
            const stepNum = parseInt(step.dataset.step, 10);
            const circle = step.querySelector('div:first-child');
            const text = step.querySelector('p');

            // Paso completado
            if (stepNum < this.currentStep) {
                circle.classList.add('bg-emerald-500', 'text-white');
                circle.classList.remove('bg-slate-200', 'text-slate-500', 'bg-indigo-600');
                text.classList.add('text-emerald-500');
                text.classList.remove('text-slate-500', 'text-indigo-600');
            }
            // Paso actual
            else if (stepNum === this.currentStep) {
                circle.classList.add('bg-indigo-600', 'text-white');
                circle.classList.remove('bg-slate-200', 'text-slate-500', 'bg-emerald-500');
                text.classList.add('text-indigo-600');
                text.classList.remove('text-slate-500', 'text-emerald-500');
            }
            // Paso pendiente
            else {
                circle.classList.remove('bg-indigo-600', 'bg-emerald-500');
                circle.classList.add('bg-slate-200', 'text-slate-500');
                text.classList.remove('text-indigo-600', 'text-emerald-500');
                text.classList.add('text-slate-500');
            }
        });

        // Actualizar línea de progreso
        const progressPercentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
        if (this.progressLine) {
            this.progressLine.style.width = `${progressPercentage}%`;
        }
    }

    /**
     * Valida los campos requeridos de un paso
     * @param {number} stepNumber - Número del paso a validar
     * @returns {boolean} True si el paso es válido
     */
    validateStep(stepNumber) {
        const currentStepEl = document.getElementById(`step-${stepNumber}`);
        if (!currentStepEl) return false;

        const inputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (input.type === 'radio') {
                const radioGroup = document.getElementsByName(input.name);
                if (![...radioGroup].some(r => r.checked)) {
                    const fieldset = input.closest('fieldset');
                    if (fieldset) fieldset.reportValidity();
                    else input.reportValidity();
                    isValid = false;
                }
            } else if (!input.checkValidity()) {
                input.reportValidity();
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Resetea el stepper al paso 1
     */
    reset() {
        this.showStep(1);
    }
}
