// main.js ist jetzt leer, die Logik und Initialisierung ist in config.js
// main.js - Finale funktionierende Version
console.log('🎯 SL Shape Generator - Final Version startet...');

class SLShapeGenerator {
    constructor() {
// main.js ist jetzt leer, die Logik ist in config.js
    }

    init() {
// main.js ist jetzt leer, die Logik ist in config.js
    }

    setupAllEventListeners() {
// main.js ist jetzt leer, die Logik ist in config.js

        // Control Buttons
        this.setupButton('reset-preview', () => this.resetShape());
        this.setupButton('random-shape', () => this.generateRandomShape());
        this.setupButton('toggle-grid', () => this.toggleGrid());
        this.setupButton('save-preset', () => this.saveCustomPreset());
        this.setupButton('copy-export', () => this.copyToClipboard());
        this.setupButton('download-export', () => this.downloadExport());

        // Export Buttons
        this.setupButton('export-json', () => this.exportJSON());
        this.setupButton('export-xml', () => this.exportXML());
        this.setupButton('export-notecard', () => this.exportNotecard());
        this.setupButton('export-share', () => this.exportShare());

        // Tabs
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        console.log('✅ Event Listeners setup complete');
    }

    setupButton(id, handler) {
// main.js ist jetzt leer, die Logik ist in config.js
    }

    switchTab(tabName) {
// main.js ist jetzt leer, die Logik ist in config.js

        // Tab Content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });
    }

    loadRonanHarris() {
        console.log('🎵 Lade Ronan Harris Preset...');
        
        this.currentShape = {
            body_height: 65, body_fat: 35, body_muscle: 60,
            torso_length: 55, leg_length: 70, shoulders: 65,
            chest: 60, waist: 45, hips: 40, belly: 35,
            head_size: 52, head_shape: 48, neck_length: 55,
            neck_thickness: 45, nose_size: 58, nose_angle: 52,
            lip_thickness: 45, jaw_angle: 62, cheekbones: 55,
            eye_depth: 48
        };

        this.updateAllSliders();
        this.updateShapeName('Ronan Harris Style');
        this.showSuccess('Ronan Harris Preset geladen! 🎵');
    }

    loadAthletic() {
        this.currentShape = {
            body_height: 70, body_fat: 25, body_muscle: 75,
            torso_length: 60, leg_length: 65, shoulders: 75,
            chest: 70, waist: 40, hips: 45, belly: 30,
            head_size: 55
        };
        this.updateAllSliders();
        this.updateShapeName('Athletischer Style');
        this.showSuccess('Athletisches Preset geladen! 💪');
    }

    loadSlim() {
        this.currentShape = {
            body_height: 65, body_fat: 20, body_muscle: 40,
            torso_length: 55, leg_length: 70, shoulders: 45,
            chest: 40, waist: 35, hips: 40, belly: 25
        };
        this.updateAllSliders();
        this.updateShapeName('Schlanker Style');
        this.showSuccess('Schlankes Preset geladen! 🌬️');
    }

    loadCurvy() {
        this.currentShape = {
            body_height: 60, body_fat: 65, body_muscle: 35,
            torso_length: 50, leg_length: 60, shoulders: 40,
            chest: 70, waist: 45, hips: 75, belly: 50
        };
        this.updateAllSliders();
        this.updateShapeName('Kurviger Style');
        this.showSuccess('Kurviges Preset geladen! 🎀');
    }

    loadMuscular() {
        this.currentShape = {
            body_height: 75, body_fat: 15, body_muscle: 85,
            torso_length: 65, leg_length: 70, shoulders: 80,
            chest: 75, waist: 35, hips: 40, belly: 20
        };
        this.updateAllSliders();
        this.updateShapeName('Muskulöser Style');
        this.showSuccess('Muskulöses Preset geladen! 🏋️');
    }

    loadPetite() {
        this.currentShape = {
            body_height: 45, body_fat: 25, body_muscle: 30,
            torso_length: 40, leg_length: 50, shoulders: 35,
            chest: 35, waist: 30, hips: 35, belly: 20
        };
        this.updateAllSliders();
        this.updateShapeName('Zierlicher Style');
        this.showSuccess('Zierliches Preset geladen! 🌸');
    }

    updateAllSliders() {
        console.log('📊 Update alle Slider...', this.currentShape);
        
        Object.keys(this.currentShape).forEach(paramId => {
            const slider = document.getElementById(`slider-${paramId}`);
            const valueDisplay = document.getElementById(`value-${paramId}`);
            const value = this.currentShape[paramId];
            
            if (slider) {
                slider.value = value;
                slider.style.background = this.getSliderGradient(value);
            }
            if (valueDisplay) {
                valueDisplay.textContent = value;
                valueDisplay.style.color = this.getValueColor(value);
            }
        });
        
        this.updateExport();
        this.updateStats();
    }

    getSliderGradient(value) {
        const percentage = value;
        return `linear-gradient(90deg, #3498db ${percentage}%, #2c3e50 ${percentage}%)`;
    }

    getValueColor(value) {
        if (value < 30) return '#e74c3c';
        if (value > 70) return '#2ecc71';
        return '#f39c12';
    }

    updateShapeName(name) {
        const nameInput = document.getElementById('shape-name');
        if (nameInput) nameInput.value = name;
    }

    resetShape() {
        this.currentShape = {};
        this.updateAllSliders();
        this.updateShapeName('Mein Avatar Shape');
        this.showSuccess('Shape zurückgesetzt! 🔄');
    }

    generateRandomShape() {
        this.currentShape = {
            body_height: this.randomValue(), body_fat: this.randomValue(),
            body_muscle: this.randomValue(), torso_length: this.randomValue(),
            leg_length: this.randomValue(), shoulders: this.randomValue(),
            chest: this.randomValue(), waist: this.randomValue(),
            hips: this.randomValue(), belly: this.randomValue(),
            head_size: this.randomValue()
        };
        
        this.updateAllSliders();
        this.updateShapeName('Zufälliger Shape');
        this.showSuccess('Zufälliger Shape generiert! 🎲');
    }

    randomValue() {
        return Math.floor(Math.random() * 101);
    }

    updateExport() {
        const output = document.getElementById('export-output');
        if (output) {
            output.value = JSON.stringify(this.currentShape, null, 2);
        }
    }

    updateStats() {
        const activeParams = Object.keys(this.currentShape).length;
        const activeParamsElement = document.getElementById('active-params');
        const paramCountElement = document.getElementById('param-count');
        
        if (activeParamsElement) activeParamsElement.textContent = activeParams;
        if (paramCountElement) paramCountElement.textContent = `${activeParams} Parameter`;
    }

    exportJSON() {
        this.updateExport();
        this.showSuccess('JSON Export bereit! 📄');
    }

    exportXML() {
        let xml = '<?xml version="1.0"?>\n<avatar_shape>\n';
        Object.keys(this.currentShape).forEach(key => {
            xml += `  <${key}>${this.currentShape[key]}</${key}>\n`;
        });
        xml += '</avatar_shape>';
        
        const output = document.getElementById('export-output');
        if (output) output.value = xml;
        this.showSuccess('XML Export bereit! 📋');
    }

    exportNotecard() {
        let notecard = 'SL Avatar Shape\n';
        notecard += '='.repeat(40) + '\n\n';
        Object.keys(this.currentShape).forEach(key => {
            notecard += `${key}=${this.currentShape[key]}\n`;
        });
        
        const output = document.getElementById('export-output');
        if (output) output.value = notecard;
        this.showSuccess('Notecard Export bereit! 📝');
    }

    exportShare() {
        this.showInfo('Share Feature coming soon! 🔄');
    }

    saveCustomPreset() {
        const nameInput = document.getElementById('preset-name');
        if (!nameInput) return;
        
        const name = nameInput.value.trim();
        if (!name) {
            this.showError('Bitte Namen eingeben!');
            return;
        }
        
        this.customPresets[name] = {
            name: name,
            parameters: {...this.currentShape},
            created: new Date().toISOString()
        };
        
        localStorage.setItem('customPresets', JSON.stringify(this.customPresets));
        nameInput.value = '';
        this.showSuccess(`Preset "${name}" gespeichert! 💾`);
    }

    copyToClipboard() {
        const output = document.getElementById('export-output');
        if (output && output.value) {
            output.select();
            document.execCommand('copy');
            this.showSuccess('In Zwischenablage kopiert! 📋');
        } else {
            this.showError('Nichts zu kopieren!');
        }
    }

    downloadExport() {
        const output = document.getElementById('export-output');
        if (output && output.value) {
            const nameInput = document.getElementById('shape-name');
            const name = nameInput ? nameInput.value : 'avatar_shape';
            const blob = new Blob([output.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.txt`;
            a.click();
            this.showSuccess('Export heruntergeladen! 💾');
        } else {
            this.showError('Nichts zu downloaden!');
        }
    }

    toggleGrid() {
        const grid = document.querySelector('.avatar-sections');
        if (grid) {
            grid.classList.toggle('hidden');
            this.showInfo(`Grid ${grid.classList.contains('hidden') ? 'aus' : 'an'}`);
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? '#e74c3c' : type === 'info' ? '#3498db' : '#2ecc71';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
        
        console.log(`💬 ${type}: ${message}`);
    }
}

// STARTE DIE APP
console.log('🎉 STARTE SL SHAPE GENERATOR...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM ist ready!');
    window.shapeApp = new SLShapeGenerator();
});