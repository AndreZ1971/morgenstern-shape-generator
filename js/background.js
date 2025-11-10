// Background Manager mit funktionellen Features
class BackgroundManager {
    constructor() {
        this.sections = new Map();
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.createAvatarSections();
        this.createParticles();
        this.createTechLines();
        this.setupSectionInteractions();
        this.isInitialized = true;
        
        console.log('🎭 Background Manager initialized');
    }

    createAvatarSections() {
        const sectionsContainer = document.createElement('div');
        sectionsContainer.className = 'avatar-sections';
        
        const sections = [
            { id: 'head', name: 'Kopf', className: 'section section-head' },
            { id: 'torso', name: 'Torso', className: 'section section-torso' },
            { id: 'arms-left', name: 'Linker Arm', className: 'section section-arms' },
            { id: 'arms-right', name: 'Rechter Arm', className: 'section section-arms right' },
            { id: 'legs', name: 'Beine', className: 'section section-legs' },
            { id: 'feet-left', name: 'Linker Fuß', className: 'section section-feet' },
            { id: 'feet-right', name: 'Rechter Fuß', className: 'section section-feet right' }
        ];

        sections.forEach(section => {
            const element = document.createElement('div');
            element.className = section.className;
            element.dataset.section = section.id;
            element.title = section.name;
            sectionsContainer.appendChild(element);
            
            this.sections.set(section.id, element);
        });

        document.body.appendChild(sectionsContainer);
    }

    createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        
        for (let i = 0; i < 30; i++) {
            this.createParticle(particlesContainer, i);
        }
        
        document.body.appendChild(particlesContainer);
    }

    createParticle(container, index) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        const left = Math.random() * 100;
        const delay = Math.random() * 6;
        const duration = Math.random() * 4 + 4;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${left}vw;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            opacity: ${Math.random() * 0.3 + 0.1};
            background: ${Math.random() > 0.5 ? 'rgba(52, 152, 219, 0.3)' : 'rgba(231, 76, 60, 0.3)'};
        `;
        
        container.appendChild(particle);
    }

    createTechLines() {
        const techLines = document.createElement('div');
        techLines.className = 'tech-lines';
        
        for (let i = 0; i < 8; i++) {
            const line = document.createElement('div');
            line.className = 'tech-line';
            
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            const duration = Math.random() * 2 + 2;
            
            line.style.cssText = `
                left: ${left}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                width: ${Math.random() * 100 + 50}px;
            `;
            
            techLines.appendChild(line);
        }
        
        document.body.appendChild(techLines);
    }

    setupSectionInteractions() {
        // Auf Slider-Änderungen reagieren
        document.addEventListener('sliderChange', (e) => {
            this.highlightRelatedSection(e.detail.parameter);
        });
    }

    highlightRelatedSection(parameterId) {
        // Zurücksetzen aller Sections
        this.sections.forEach(section => {
            section.classList.remove('active');
        });

        // Mapping von Parametern zu Sections
        const sectionMap = {
            // Kopf-Parameter
            'head_size': 'head', 'head_shape': 'head', 'neck_length': 'head', 'neck_thickness': 'head',
            // Gesicht-Parameter
            'nose_size': 'head', 'nose_angle': 'head', 'nose_curvature': 'head', 'lip_thickness': 'head',
            'lip_width': 'head', 'jaw_angle': 'head', 'jaw_width': 'head', 'cheekbones': 'head',
            'cheek_fat': 'head', 'eye_depth': 'head', 'eye_size': 'head', 'eye_angle': 'head',
            'brow_depth': 'head', 'brow_angle': 'head', 'ear_size': 'head', 'ear_angle': 'head',
            // Torso-Parameter
            'shoulders': 'torso', 'chest': 'torso', 'waist': 'torso', 'hips': 'torso', 
            'belly': 'torso', 'torso_length': 'torso', 'body_muscle': 'torso', 'body_fat': 'torso',
            // Arme
            'arm_length': 'arms-left', 'hand_size': 'arms-left',
            // Beine
            'body_height': 'legs', 'leg_length': 'legs'
        };

        const sectionId = sectionMap[parameterId];
        if (sectionId && this.sections.has(sectionId)) {
            const section = this.sections.get(sectionId);
            section.classList.add('active');
            
            // Aktive Section in Stats anzeigen
            const activeSectionElement = document.getElementById('active-section');
            if (activeSectionElement) {
                activeSectionElement.textContent = section.title;
            }
            
            // Symmetrie für Arme
            if (sectionId === 'arms-left') {
                this.sections.get('arms-right').classList.add('active');
            }
        }
    }

    // Grid ein/ausschalten
    toggleGrid() {
        const sections = document.querySelector('.avatar-sections');
        if (sections) {
            sections.classList.toggle('hidden');
        }
    }

    // Für spätere Erweiterungen
    showMeasurementLines() {
        console.log('📏 Measurement lines feature coming soon...');
    }

    showGoldenRatio() {
        console.log('📐 Golden ratio overlay coming soon...');
    }
}

// Background sofort initialisieren
document.addEventListener('DOMContentLoaded', () => {
    window.backgroundManager = new BackgroundManager();
});