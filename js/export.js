// Export Manager - Vollständige Export-Funktionen
class ShapeExporter {
    constructor() {
        this.exportTypes = {
            json: this.exportToJSON.bind(this),
            xml: this.exportToXML.bind(this),
            notecard: this.exportToNotecard.bind(this),
            share: this.exportToShare.bind(this)
        };
        this.init();
    }

    init() {
        console.log('📤 Export Manager initialized');
    }

    updatePreview(shapeData) {
        const output = document.getElementById('export-output');
        let exportData = shapeData;
        // Wenn ein Preset aktiv ist, nimm alle Parameter aus dem Preset
        if (window.shapeApp && window.shapeApp.currentShape && window.SHAPE_PRESETS) {
            const presetName = document.getElementById('shape-name')?.value;
            const preset = Object.values(window.SHAPE_PRESETS).find(p => p.name === presetName);
            if (preset && preset.parameters) {
                exportData = { ...preset.parameters };
            }
        }
        if (output) {
            output.value = this.exportToNotecard(exportData, 'Mein Avatar');
        }
        // Parameter Count aktualisieren
        const paramCount = document.getElementById('param-count');
        if (paramCount) {
            paramCount.textContent = `${Object.keys(exportData).length} Parameter`;
        }
    }

    exportShape(shapeData, format, shapeName = 'Unbenannter Shape') {
        let exportData = shapeData;
        // Wenn ein Preset aktiv ist, nimm alle Parameter aus dem Preset
        if (window.shapeApp && window.shapeApp.currentShape && window.SHAPE_PRESETS) {
            const genderPresets = window.SHAPE_PRESETS[window.shapeApp.selectedGender] || {};
            const preset = Object.values(genderPresets).find(p => p.name === shapeName);
            if (preset && preset.parameters) {
                exportData = { ...preset.parameters };
            }
        }
        const exporter = this.exportTypes[format];
        if (exporter) {
            const result = exporter(exportData, shapeName);
            this.displayExport(result, format, shapeName);
            return result;
        } else {
            console.error(`Unbekanntes Export-Format: ${format}`);
            return null;
        }
    }

    exportToJSON(shapeData, shapeName) {
        const exportData = {
            meta: {
                name: shapeName,
                erstellt: new Date().toLocaleString('de-DE'),
                generator: 'SL Shape Generator',
                version: '1.0'
            },
            shape: shapeData,
            parameter_anzahl: Object.keys(shapeData).length
        };
        return JSON.stringify(exportData, null, 2);
    }

    exportToXML(shapeData, shapeName) {
        console.log('[DEBUG] exportToXML aufgerufen', { shapeData, shapeName });
        let exportData = shapeData;
        // Wenn ein Preset aktiv ist, nimm alle Parameter aus dem Preset
        if (window.shapeApp && window.shapeApp.currentShape && window.SHAPE_PRESETS) {
            const genderPresets = window.SHAPE_PRESETS[window.shapeApp.selectedGender] || {};
            const preset = Object.values(genderPresets).find(p => p.name === shapeName);
            if (preset && preset.parameters) {
                exportData = { ...preset.parameters };
            }
        }
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<avatar_shape>\n';
        xml += '  <meta>\n';
        xml += `    <name>${this.escapeXML(shapeName)}</name>\n`;
        xml += `    <erstellt>${new Date().toLocaleString('de-DE')}</erstellt>\n`;
        xml += '    <generator>SL Shape Generator</generator>\n';
        xml += '  </meta>\n';
        const gender = window.shapeApp ? window.shapeApp.selectedGender : 'male';
        const categories = window.SHAPE_PARAMETERS[gender];
        Object.keys(categories).forEach(cat => {
            xml += `  <${cat}>\n`;
            categories[cat].forEach(param => {
                const value = exportData[param.id] !== undefined ? exportData[param.id] : param.default;
                xml += `    <${param.id}>${value}</${param.id}> <!-- ${param.name} -->\n`;
            });
            xml += `  </${cat}>\n`;
        });
        xml += '</avatar_shape>';
        return xml;
    }

    exportToNotecard(shapeData, shapeName) {
        let notecard = `SL Avatar Shape - ${shapeName}\n`;
        notecard += `Erstellt am: ${new Date().toLocaleString('de-DE')}\n`;
        notecard += '='.repeat(40) + '\n\n';
        notecard += '[SHAPE_PARAMETER]\n\n';

        // Kategorien und Parameter aus window.SHAPE_PARAMETERS
        const gender = window.shapeApp ? window.shapeApp.selectedGender : 'male';
        const categories = window.SHAPE_PARAMETERS[gender];
        Object.keys(categories).forEach(cat => {
            let catLabel = '';
            switch(cat) {
                case 'body': catLabel = '\n// KÖRPER'; break;
                case 'head': catLabel = '\n// KOPF'; break;
                case 'eyes': catLabel = '\n// AUGEN'; break;
                case 'ears': catLabel = '\n// OHREN'; break;
                case 'nose': catLabel = '\n// NASE'; break;
                case 'mouth': catLabel = '\n// MUND'; break;
                case 'chin': catLabel = '\n// KINN'; break;
                case 'upperbody': catLabel = '\n// OBERKÖRPER'; break;
                case 'legs': catLabel = '\n// BEINE'; break;
                default: catLabel = `\n// ${cat}`;
            }
            notecard += catLabel + '\n';
            categories[cat].forEach(param => {
                const value = shapeData[param.id] !== undefined ? shapeData[param.id] : param.default;
                notecard += `${param.id}: ${value} // ${param.name}\n`;
            });
        });
        notecard += '\n// ENDE DER NOTIZKARTE';
        return notecard;
    }

    exportToShare(shapeData, shapeName) {
        // Komprimierte Daten für URL (Base64)
        const dataStr = JSON.stringify({
            n: shapeName,
            d: shapeData,
            v: '1.0'
        });
        // Hier könnte eine Base64-Kodierung erfolgen
        return btoa(dataStr);
    }

    displayExport(content, format, shapeName) {
        console.log('[DEBUG] displayExport aufgerufen', { content, format, shapeName });
        const output = document.getElementById('export-output');
        if (output) {
            output.value = content;
            // Syntax Highlighting vorbereiten
            output.className = `export-${format}`;
            // Auto-scroll to bottom
            output.scrollTop = output.scrollHeight;
        }
        // Erfolgsmeldung
        if (window.shapeApp) {
            window.shapeApp.showNotification(`${format.toUpperCase()} Export für "${shapeName}" wurde erstellt.`);
        }
    }
}

// Klasse im globalen Scope registrieren
if (typeof window !== 'undefined') {
    window.ShapeExporter = ShapeExporter;
    window.shapeExporter = new ShapeExporter();
    console.log('[DEBUG] window.ShapeExporter und window.shapeExporter initialisiert');
}

// (Entfernt: Duplikate der Methoden escapeXML, validateShape, getShapeStats außerhalb der Klasse)


// Klasse im globalen Scope registrieren
if (typeof window !== 'undefined') {
    window.ShapeExporter = ShapeExporter;
    window.shapeExporter = new ShapeExporter();
    console.log('[DEBUG] window.ShapeExporter und window.shapeExporter initialisiert');
}

