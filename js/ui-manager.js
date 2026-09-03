/**
 * Gestor de UI - Modales, notificaciones y elementos de interfaz
 * @module ui-manager
 */

/**
 * Clase para gestionar la interfaz de usuario
 */
export class UIManager {
    constructor() {
        this.modals = {
            submission: document.getElementById('submissionModal'),
            update: document.getElementById('updateModal'),
            alreadySubmitted: document.getElementById('alreadySubmittedModal'),
            deleteConfirm: document.getElementById('deleteConfirmModal'),
            details: document.getElementById('detailsModal')
        };

        this.elements = {
            adminLoginBox: document.getElementById('admin-login-box'),
            dbSection: document.getElementById('dbSection'),
            dbTable: document.getElementById('dbTable'),
            dbTableBody: document.getElementById('dbTableBody'),
            loading: document.getElementById('loading'),
            noData: document.getElementById('no-data'),
            detailsModalBody: document.getElementById('detailsModalBody')
        };

        this.initializeModalListeners();
    }

    /**
     * Inicializa los event listeners de los modales
     */
    initializeModalListeners() {
        // Cerrar modal de envío exitoso
        const closeSubmissionBtn = document.getElementById('closeSubmissionModal');
        if (closeSubmissionBtn) {
            closeSubmissionBtn.addEventListener('click', () => {
                this.hideModal('submission');
            });
        }

        // Cerrar modal de actualización
        const closeUpdateBtn = document.getElementById('closeUpdateModal');
        if (closeUpdateBtn) {
            closeUpdateBtn.addEventListener('click', () => {
                this.hideModal('update');
            });
        }

        // Cerrar modal de duplicado
        const closeAlreadySubmittedBtn = document.getElementById('closeAlreadySubmittedModal');
        if (closeAlreadySubmittedBtn) {
            closeAlreadySubmittedBtn.addEventListener('click', () => {
                this.hideModal('alreadySubmitted');
            });
        }

        // Cerrar modal de detalles
        const closeDetailsBtn = document.getElementById('closeDetailsModalBtn');
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', () => {
                this.hideModal('details');
            });
        }

        // Cancelar eliminación
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideModal('deleteConfirm');
            });
        }

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    /**
     * Muestra un modal
     * @param {string} modalName - Nombre del modal
     */
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');

            // Focus en el primer elemento interactivo
            const firstButton = modal.querySelector('button');
            if (firstButton) {
                setTimeout(() => firstButton.focus(), 100);
            }
        }
    }

    /**
     * Oculta un modal
     * @param {string} modalName - Nombre del modal
     */
    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Oculta todos los modales
     */
    hideAllModals() {
        Object.keys(this.modals).forEach(modalName => {
            this.hideModal(modalName);
        });
    }

    /**
     * Muestra el panel de administración
     */
    showAdminPanel() {
        if (this.elements.adminLoginBox) {
            this.elements.adminLoginBox.style.display = 'none';
        }
        if (this.elements.dbSection) {
            this.elements.dbSection.classList.remove('hidden');
        }
    }

    /**
     * Oculta el panel de administración
     */
    hideAdminPanel() {
        if (this.elements.adminLoginBox) {
            this.elements.adminLoginBox.style.display = 'block';
        }
        if (this.elements.dbSection) {
            this.elements.dbSection.classList.add('hidden');
        }
    }

    /**
     * Muestra indicador de carga
     */
    showLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.remove('hidden');
        }
        if (this.elements.dbTable) {
            this.elements.dbTable.classList.add('hidden');
        }
        if (this.elements.noData) {
            this.elements.noData.classList.add('hidden');
        }
    }

    /**
     * Oculta indicador de carga
     */
    hideLoading() {
        if (this.elements.loading) {
            this.elements.loading.classList.add('hidden');
        }
    }

    /**
     * Muestra mensaje de "sin datos"
     */
    showNoData() {
        this.hideLoading();
        if (this.elements.noData) {
            this.elements.noData.classList.remove('hidden');
        }
        if (this.elements.dbTable) {
            this.elements.dbTable.classList.add('hidden');
        }
    }

    /**
     * Muestra la tabla de datos
     */
    showTable() {
        this.hideLoading();
        if (this.elements.dbTable) {
            this.elements.dbTable.classList.remove('hidden');
        }
        if (this.elements.noData) {
            this.elements.noData.classList.add('hidden');
        }
    }

    /**
     * Limpia el cuerpo de la tabla
     */
    clearTable() {
        if (this.elements.dbTableBody) {
            this.elements.dbTableBody.innerHTML = '';
        }
    }

    /**
     * Muestra detalles de una ficha en el modal
     * @param {Object} data - Datos de la ficha
     * @param {Object} translations - Traducciones de campos
     */
    showDetails(data, translations) {
        if (!this.elements.detailsModalBody) return;

        let html = '<dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">';

        for (const key in translations) {
            if (Object.hasOwnProperty.call(data, key)) {
                let value = data[key] || 'No especificado';

                // Formatear valores
                if (Array.isArray(value)) {
                    value = value.join(', ');
                }

                const valueMap = {
                    'on': 'Sí',
                    'authorize': 'AUTORIZO',
                    'not_authorize': 'NO AUTORIZO',
                    'yes': 'Sí',
                    'no': 'No'
                };

                value = valueMap[value] || value;

                html += `
          <div class="p-3 bg-slate-50 rounded-lg break-words">
            <dt class="font-semibold text-slate-800">${translations[key] || key}</dt>
            <dd class="text-slate-600 mt-1">${value}</dd>
          </div>
        `;
            }
        }

        html += '</dl>';
        this.elements.detailsModalBody.innerHTML = html;
        this.showModal('details');
    }

    /**
     * Muestra un mensaje de error
     * @param {string} message - Mensaje de error
     * @param {string} elementId - ID del elemento donde mostrar el error
     */
    showError(message, elementId = 'admin-login-error') {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.setAttribute('role', 'alert');
        }
    }

    /**
     * Oculta un mensaje de error
     * @param {string} elementId - ID del elemento de error
     */
    hideError(elementId = 'admin-login-error') {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Muestra una notificación toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duración en ms (0 = permanente)
     */
    showToast(message, type = 'info', duration = 3000) {
        // Crear elemento toast si no existe
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `
      px-6 py-4 rounded-lg shadow-lg text-white transform transition-all duration-300
      ${type === 'success' ? 'bg-emerald-600' : ''}
      ${type === 'error' ? 'bg-red-600' : ''}
      ${type === 'warning' ? 'bg-amber-600' : ''}
      ${type === 'info' ? 'bg-indigo-600' : ''}
    `;
        toast.setAttribute('role', 'alert');
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Animar entrada
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // Auto-eliminar
        if (duration > 0) {
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    }

    /**
     * Actualiza el nombre de la escuela en la UI
     * @param {string} schoolName - Nombre de la escuela
     */
    updateSchoolName(schoolName) {
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = `Ficha de Salud - ${schoolName}`;
        }

        document.querySelectorAll('.school-name-placeholder').forEach(element => {
            element.textContent = schoolName;
        });
    }

    /**
     * Activa/desactiva campos de solo lectura
     * @param {boolean} readonly - Si debe ser solo lectura
     */
    setSchoolFieldsReadonly(readonly) {
        const schoolNameInput = document.getElementById('schoolName');
        const schoolYearInput = document.getElementById('schoolYear');

        if (schoolNameInput) {
            schoolNameInput.readOnly = readonly;
        }
        if (schoolYearInput) {
            schoolYearInput.readOnly = readonly;
        }
    }
}

// Exportar instancia singleton
export const uiManager = new UIManager();
