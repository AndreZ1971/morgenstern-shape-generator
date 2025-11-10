// preview.js - Einfache und zuverlässige 3D Vorschau
class AvatarPreview {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.isInitialized = false;
        this.realisticAvatar = null;
        console.log('👤 Starte 3D Avatar Preview...');
        this.init();
    }

    init() {
        try {
            const container = document.getElementById('avatar-preview');
            if (!container) {
                console.error('❌ Container #avatar-preview nicht gefunden!');
                this.showFallbackPreview('Container nicht gefunden');
                return;
            }

            console.log('✅ Container gefunden, Größe:', container.clientWidth, 'x', container.clientHeight);

            // Container vorbereiten
            container.innerHTML = '<div class="loading-spinner">🔄 3D Vorschau wird geladen...</div>';
            container.style.background = '#1a1a2e';
            container.style.border = '2px solid #4a90e2';
            container.style.borderRadius = '10px';
            container.style.display = 'block';
            container.style.overflow = 'hidden';

            // Three.js Verfügbarkeit prüfen
            if (typeof THREE === 'undefined') {
                console.error('❌ Three.js nicht geladen!');
                this.showFallbackPreview('Three.js fehlt');
                return;
            }

            // Kurz warten damit Container gerendert wird
            setTimeout(() => {
                this.createScene(container);
            }, 100);

        } catch (error) {
            console.error('❌ Fehler in init():', error);
            this.showFallbackPreview('Init Fehler: ' + error.message);
        }
    }

    createScene(container) {
        try {
            // Container Größe
            const width = container.clientWidth || 400;
            const height = container.clientHeight || 400;
            
            console.log('📐 Erstelle Scene mit:', width, 'x', height);

            // 1. SCENE
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x1a1a2e);

            // 2. CAMERA
            this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
            this.camera.position.set(0, 2, 6);
            this.camera.lookAt(0, 1, 0);

            // 3. RENDERER
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: false
            });
            this.renderer.setSize(width, height);
            this.renderer.setClearColor(0x1a1a2e, 1);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

            // Canvas stylen
            const canvas = this.renderer.domElement;
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.borderRadius = '8px';

            // Renderer zum Container hinzufügen
            container.innerHTML = '';
            container.appendChild(canvas);

            console.log('✅ Canvas erstellt und hinzugefügt');

            // 4. BELEUCHTUNG
            this.setupLighting();

            // 5. REALISTISCHEN AVATAR LADEN
            this.realisticAvatar = new RealisticAvatar(this.scene);

            // 6. HINTERGRUND & BODEN
            this.setupEnvironment();

            // 7. ANIMATION STARTEN
            this.animate();

            this.isInitialized = true;
            console.log('🎉 3D Preview erfolgreich initialisiert!');

        } catch (error) {
            console.error('❌ Fehler in createScene():', error);
            this.showFallbackPreview('Scene Fehler: ' + error.message);
        }
    }

    setupLighting() {
        // Helles Umgebungslicht
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Hauptlicht
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(10, 15, 10);
        mainLight.castShadow = true;
        this.scene.add(mainLight);

        // Fülllicht von vorne
        const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
        fillLight.position.set(-5, 5, 5);
        this.scene.add(fillLight);

        console.log('💡 Beleuchtung eingerichtet');
    }

    createSimpleAvatar() {
        // Hauptgruppe
        this.mesh = new THREE.Group();

        // KÖRPER (blau)
        const bodyGeometry = new THREE.CylinderGeometry(0.8, 0.6, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4a90e2,
            shininess: 30
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        this.mesh.add(body);

        // KOPF (hautfarben)
        const headGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const headMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf0d9b5,
            shininess: 40
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.5;
        head.castShadow = true;
        this.mesh.add(head);

        // ARME (hautfarben)
        const armGeometry = new THREE.CylinderGeometry(0.15, 0.12, 1.5, 8);
        const armMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xf0d9b5,
            shininess: 30
        });

        // Linker Arm
        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-1, 1.2, 0);
        leftArm.rotation.z = Math.PI / 6;
        leftArm.castShadow = true;
        this.mesh.add(leftArm);

        // Rechter Arm
        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(1, 1.2, 0);
        rightArm.rotation.z = -Math.PI / 6;
        rightArm.castShadow = true;
        this.mesh.add(rightArm);

        // BEINE (dunkelblau)
        const legGeometry = new THREE.CylinderGeometry(0.2, 0.15, 2, 8);
        const legMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c3e50,
            shininess: 30
        });

        // Linkes Bein
        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.3, -1, 0);
        leftLeg.castShadow = true;
        this.mesh.add(leftLeg);

        // Rechtes Bein
        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.3, -1, 0);
        rightLeg.castShadow = true;
        this.mesh.add(rightLeg);

        // TEST-WÜRFEL (rot) - um zu sehen ob etwas gerendert wird
        const testCubeGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        const testCubeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const testCube = new THREE.Mesh(testCubeGeometry, testCubeMaterial);
    testCube.position.set(0, 2.5, 0);
    this.mesh.add(testCube);
    // Avatar zur Scene hinzufügen
    this.mesh.scale.set(1.2, 1.2, 1.2); // Avatar etwas größer machen
    this.scene.add(this.mesh);
    console.log('👤 Avatar erstellt mit Test-Würfel');
    }

    setupEnvironment() {
        // BODEN (Grid)
        const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);

        // ACHSEN HELPER (X=rot, Y=grün, Z=blau)
        const axesHelper = new THREE.AxesHelper(2);
        this.scene.add(axesHelper);

        console.log('🌍 Umgebung eingerichtet');
    }

    updateShape(shapeData) {
        if (!this.isInitialized) {
            console.log('⚠️ Preview nicht bereit für Update');
            return;
        }
        try {
            console.log('🔄 Update Shape mit:', shapeData);
            // Realistischen Avatar updaten
            if (this.realisticAvatar) {
                this.realisticAvatar.updateShape(shapeData);
            }
            // Optional: Fallback auf das alte Modell
            // ...
            console.log('✅ Shape aktualisiert');
        } catch (error) {
            console.error('❌ Fehler beim Update:', error);
        }
    }

    animate() {
        if (!this.isInitialized) return;

        requestAnimationFrame(() => this.animate());

        // Sanfte Rotation
        if (this.mesh) {
            this.mesh.rotation.y += 0.01;
        }

        // RENDERN
        this.renderer.render(this.scene, this.camera);
    }

    showFallbackPreview(reason) {
        const container = document.getElementById('avatar-preview');
        if (!container) return;

        console.log('🔄 Aktiviere Fallback:', reason);

        container.innerHTML = `
            <div class="fallback-preview">
                <div class="fallback-visual">
                    <div class="avatar-silhouette">
                        <div class="part head"></div>
                        <div class="part body"></div>
                        <div class="part left-arm"></div>
                        <div class="part right-arm"></div>
                        <div class="part left-leg"></div>
                        <div class="part right-leg"></div>
                    </div>
                </div>
                <div class="fallback-info">
                    <h4>3D Vorschau</h4>
                    <p>Live-Visualisierung deines Avatar Shapes</p>
                    <div class="live-values">
                        <div class="value">
                            <span class="label">Körpergröße:</span>
                            <span class="number" id="fb-height">50</span>
                        </div>
                        <div class="value">
                            <span class="label">Muskeln:</span>
                            <span class="number" id="fb-muscle">50</span>
                        </div>
                        <div class="value">
                            <span class="label">Kopf:</span>
                            <span class="number" id="fb-head">50</span>
                        </div>
                    </div>
                    <div class="fallback-note">
                        <small>Die Werte werden in Echtzeit aktualisiert</small>
                    </div>
                </div>
            </div>
        `;

        // Event Listener für Live-Updates
        document.addEventListener('sliderChange', (e) => {
            this.updateFallbackDisplay(e.detail);
        });

        console.log('✅ Fallback aktiviert');
    }

    updateFallbackDisplay(detail) {
        const { parameter, value } = detail;
        
        switch(parameter) {
            case 'body_height':
                document.getElementById('fb-height').textContent = value;
                break;
            case 'body_muscle':
                document.getElementById('fb-muscle').textContent = value;
                break;
            case 'head_size':
                document.getElementById('fb-head').textContent = value;
                break;
        }
    }

    onResize() {
        if (!this.isInitialized) return;

        const container = document.getElementById('avatar-preview');
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

// Fallback CSS
const fallbackCSS = `
.fallback-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: white;
    padding: 20px;
    border-radius: 8px;
}

.fallback-visual {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.avatar-silhouette {
    position: relative;
    width: 120px;
    height: 200px;
}

.avatar-silhouette .part {
    position: absolute;
    background: #4a90e2;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 5px;
}

.avatar-silhouette .head {
    width: 40px;
    height: 40px;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 50%;
    background: #f0d9b5;
}

.avatar-silhouette .body {
    width: 60px;
    height: 60px;
    top: 40px;
    left: 50%;
    transform: translateX(-50%);
}

.avatar-silhouette .left-arm {
    width: 20px;
    height: 50px;
    top: 50px;
    left: 10px;
    transform: rotate(20deg);
}

.avatar-silhouette .right-arm {
    width: 20px;
    height: 50px;
    top: 50px;
    right: 10px;
    transform: rotate(-20deg);
}

.avatar-silhouette .left-leg {
    width: 20px;
    height: 60px;
    top: 100px;
    left: 30px;
}

.avatar-silhouette .right-leg {
    width: 20px;
    height: 60px;
    top: 100px;
    right: 30px;
}

.fallback-info {
    text-align: center;
}

.fallback-info h4 {
    color: #4a90e2;
    margin: 0 0 10px 0;
    font-size: 1.2em;
}

.fallback-info p {
    margin: 0 0 15px 0;
    opacity: 0.8;
}

.live-values {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 10px;
}

.value {
    background: rgba(74, 144, 226, 0.2);
    padding: 8px 12px;
    border-radius: 20px;
    border: 1px solid #4a90e2;
    min-width: 80px;
}

.value .label {
    display: block;
    font-size: 10px;
    opacity: 0.8;
    margin-bottom: 2px;
}

.value .number {
    display: block;
    font-weight: bold;
    color: #4a90e2;
    font-size: 14px;
}

.fallback-note {
    opacity: 0.6;
    font-size: 11px;
}
`;

// CSS injecten
if (!document.querySelector('#fallback-css')) {
    const style = document.createElement('style');
    style.id = 'fallback-css';
    style.textContent = fallbackCSS;
    document.head.appendChild(style);
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starte Avatar Preview...');
    setTimeout(() => {
        window.avatarPreview = new AvatarPreview();
    }, 1000); // Mehr Zeit für Loading
});

// Resize Handler
window.addEventListener('resize', () => {
    if (window.avatarPreview) {
        window.avatarPreview.onResize();
    }
});

window.AvatarPreview = AvatarPreview;