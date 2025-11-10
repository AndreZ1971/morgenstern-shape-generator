// avatar-loader.js
// Lädt ein GLTF-Avatar-Modell und bindet Shape-Parameter

// GLTFLoader von Three.js einbinden (CDN)
// <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/examples/js/loaders/GLTFLoader.min.js"></script>

class RealisticAvatar {
    constructor(scene) {
        this.scene = scene;
        this.avatar = null;
        this.morphTargets = {};
        this.loadModel();
    }

    loadModel() {
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.error('GLTFLoader wurde nicht gefunden! Bitte prüfe die Einbindung.');
            return;
        }
        const loader = new THREE.GLTFLoader();
        loader.load('images/Male base.glb', (gltf) => {
            this.avatar = gltf.scene;
            this.scene.add(this.avatar);
            // MorphTargets/Bones finden
            this.findMorphTargets(this.avatar);
            console.log('✅ Avatar erfolgreich geladen:', this.avatar);
        }, undefined, (error) => {
            console.error('❌ Fehler beim Laden des Avatars:', error);
        });
    }

    findMorphTargets(object) {
        object.traverse((child) => {
            if (child.isMesh && child.morphTargetDictionary) {
                this.morphTargets = child.morphTargetDictionary;
                this.mesh = child;
                console.log('✅ MorphTargets gefunden:', this.morphTargets);
            }
        });
    }

    // Beispiel: Shape-Parameter auf MorphTargets anwenden
    updateShape(params) {
        if (!this.mesh || !this.mesh.morphTargetInfluences) return;
        // Mapping: z.B. 'head_size' -> 'HeadSize', 'body_height' -> 'BodyHeight'
        Object.keys(params).forEach(key => {
            const morphName = this.mapParamToMorph(key);
            if (morphName && this.morphTargets[morphName] !== undefined) {
                const index = this.morphTargets[morphName];
                this.mesh.morphTargetInfluences[index] = params[key] / 100; // Werte normalisieren
            }
        });
    }

    mapParamToMorph(param) {
        // Mapping-Tabelle anpassen je nach Modell
        const map = {
            head_size: 'HeadSize',
            body_height: 'BodyHeight',
            body_fat: 'BodyFat',
            body_muscle: 'BodyMuscle',
            shoulders: 'Shoulders',
            chest_size: 'ChestSize',
            waist: 'Waist',
            hips: 'Hips',
            // ... weitere Zuordnungen
        };
        return map[param];
    }
}

// Beispiel-Integration in preview.js:
// window.realisticAvatar = new RealisticAvatar(scene);
// ...
// realistischAvatar.updateShape(shapeData);

// Hinweis: Das Modell 'models/avatar.gltf' muss vorhanden sein und MorphTargets haben.