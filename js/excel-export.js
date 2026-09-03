/**
 * Módulo para gestión de exportación a Excel
 * @module excel-export
 */

import { FIELD_TRANSLATIONS } from './config.js';
import { getHealthStatus, formatValue } from './health-status.js';

/**
 * Formatea los datos de un documento para Excel
 * @param {firebase.firestore.DocumentSnapshot} docSnap - Snapshot del documento
 * @returns {Object} Datos formateados
 */
export function formatDataForExcel(docSnap) {
    const data = docSnap.data();
    const formattedData = { 'Estado': getHealthStatus(data).name };

    for (const key in FIELD_TRANSLATIONS) {
        const value = formatValue(data[key]);
        const translatedKey = FIELD_TRANSLATIONS[key];
        formattedData[translatedKey] = value;
    }

    return formattedData;
}

/**
 * Genera y descarga un archivo Excel con múltiples hojas
 * @param {Object} sheetsData - Objeto con nombre de hoja como clave y array de datos como valor
 * @param {string} fileName - Nombre del archivo
 */
export function generateAndDownloadExcel(sheetsData, fileName) {
    if (!window.XLSX) {
        console.error('SheetJS library not loaded');
        return;
    }

    const wb = XLSX.utils.book_new();
    const headers = ['Estado', ...Object.values(FIELD_TRANSLATIONS)];

    // Estilos
    const headerStyle = {
        font: { bold: true },
        fill: { fgColor: { rgb: "E9E9E9" } },
        border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
        }
    };

    const fills = {
        Rojo: { fgColor: { rgb: "FFC7CE" } },
        Amarillo: { fgColor: { rgb: "FFEB9C" } },
        Verde: { fgColor: { rgb: "C6EFCE" } }
    };

    // Crear hojas
    for (const sheetName in sheetsData) {
        if (sheetsData[sheetName].length === 0) continue;

        const ws = XLSX.utils.json_to_sheet(sheetsData[sheetName], { header: headers });
        ws['!cols'] = headers.map(() => ({ wch: 25 }));
        const range = XLSX.utils.decode_range(ws['!ref']);

        // Aplicar estilo a cabeceras
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell_ref = XLSX.utils.encode_cell({ c: C, r: 0 });
            if (ws[cell_ref]) ws[cell_ref].s = headerStyle;
        }

        // Aplicar estilo a filas de datos
        for (let R = 1; R <= range.e.r; ++R) {
            const statusCellRef = XLSX.utils.encode_cell({ c: 0, r: R });
            const status = ws[statusCellRef]?.v;
            const rowFill = fills[status] || null;

            for (let C = range.s.c; C <= range.e.c; ++C) {
                const cell_ref = XLSX.utils.encode_cell({ c: C, r: R });
                if (!ws[cell_ref]) ws[cell_ref] = { t: 's', v: '' };
                ws[cell_ref].s = {
                    border: headerStyle.border,
                    fill: rowFill
                };
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }

    // Descargar archivo
    if (wb.SheetNames.length > 0) {
        XLSX.writeFile(wb, fileName);
        return true;
    }

    return false;
}

/**
 * Clase para gestionar exportaciones
 */
export class ExcelExporter {
    constructor(dbCollectionRef, schoolNameInput, schoolYearInput, groupFilterButtons) {
        this.dbCollectionRef = dbCollectionRef;
        this.schoolNameInput = schoolNameInput;
        this.schoolYearInput = schoolYearInput;
        this.groupFilterButtons = groupFilterButtons;
    }

    /**
     * Exporta todos los datos agrupados por curso
     */
    async exportAll() {
        try {
            const querySnapshot = await this.dbCollectionRef.get();

            if (querySnapshot.empty) {
                return { success: false, message: 'No hay datos para exportar.' };
            }

            const sheets = {};
            const groupButtons = [...this.groupFilterButtons.querySelectorAll('button')]
                .filter(b => b.dataset.group !== 'all');

            // Preparar hojas por nombre de grupo
            groupButtons.forEach(button => sheets[button.textContent] = []);

            // Agrupar datos por curso
            querySnapshot.forEach(docSnap => {
                const groupKey = docSnap.data().group;
                const button = groupButtons.find(b => b.dataset.group === groupKey);
                const groupName = button ? button.textContent : 'Sin Grupo';

                if (!sheets[groupName]) sheets[groupName] = [];
                sheets[groupName].push(formatDataForExcel(docSnap));
            });

            // Generar nombre de archivo
            const schoolName = this.schoolNameInput.value.replace(/ /g, '_');
            const schoolYear = this.schoolYearInput.value.replace('/', '-');
            const fileName = `FichasSalud_${schoolName}_TodosLosCursos_${schoolYear}.xlsx`;

            const success = generateAndDownloadExcel(sheets, fileName);
            return { success, message: success ? 'Exportación completada' : 'Error al exportar' };

        } catch (error) {
            console.error('Error exporting all data:', error);
            return { success: false, message: `Error: ${error.message}` };
        }
    }

    /**
     * Exporta la vista actual
     * @param {Array<HTMLElement>} rows - Filas visibles en la tabla
     * @param {firebase.firestore.Firestore} db - Instancia de Firestore
     * @param {string} collectionPath - Ruta de la colección
     */
    async exportView(rows, db, collectionPath) {
        if (rows.length === 0) {
            return { success: false, message: 'No hay datos en la vista actual para exportar.' };
        }

        try {
            const docsData = await Promise.all(
                Array.from(rows).map(row =>
                    db.collection(collectionPath).doc(row.dataset.docId).get()
                        .then(docSnap => docSnap.exists ? formatDataForExcel(docSnap) : null)
                )
            );

            const activeButton = this.groupFilterButtons.querySelector('.active');
            const sheetName = activeButton ? activeButton.textContent : 'VistaActual';
            const schoolName = this.schoolNameInput.value.replace(/ /g, '_');
            const fileName = `FichasSalud_${schoolName}_${sheetName.replace(/ /g, '_')}.xlsx`;

            const success = generateAndDownloadExcel(
                { [sheetName]: docsData.filter(d => d) },
                fileName
            );

            return { success, message: success ? 'Exportación completada' : 'Error al exportar' };

        } catch (error) {
            console.error('Error exporting view data:', error);
            return { success: false, message: `Error: ${error.message}` };
        }
    }
}
