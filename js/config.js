// Export Manager sofort initialisieren, damit Event-Listener funktionieren

// Hilfsfunktion: Parameter aus XML in Kategorien sortieren
function categorizeXmlParams(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  const params = xmlDoc.querySelectorAll("param");
  // Zielkategorien
  const categories = {
    body: [],
    head: [],
    eyes: [],
    ears: [],
    nose: [],
    mouth: [],
    chin: [],
    upperbody: [],
    legs: [],
  };
  return categories;
}

// KLASSENDEFINITION BEGINNT HIER
class SLShapeGenerator {
  renderPresetButtons() {
      console.log('[DEBUG] renderPresetButtons() aufgerufen');
    const presetGrid = document.querySelector('.preset-grid');
    if (presetGrid) {
      presetGrid.innerHTML = '';
      const genderPresets = window.SHAPE_PRESETS[this.selectedGender] || {};
      Object.keys(genderPresets).forEach((presetId) => {
        const preset = genderPresets[presetId];
        if (!preset || !preset.parameters) return;
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.dataset.preset = presetId;
        btn.textContent = preset.name || presetId;
        btn.addEventListener('click', (e) => {
            console.log(`[DEBUG] Preset-Button geklickt: ${presetId}`);
          this.loadShapePreset(presetId);
        });
        presetGrid.appendChild(btn);
      });
      console.log(`[DEBUG] Preset-Buttons generiert: ${presetGrid.children.length}`);
    }
  }

  constructor() {
      console.log('[DEBUG] SLShapeGenerator Konstruktor aufgerufen');
    this.selectedGender = 'male'; // Standardwert
    this.currentShape = {};
    this.customPresets = JSON.parse(
      localStorage.getItem("customPresets") || "{}"
    );
    this.configCheckAttempts = 0;
    this.maxConfigAttempts = 50; // Max 5 Sekunden warten
    this.init();
  }

  init() {
      console.log('[DEBUG] init() aufgerufen');
    console.log("🚀 SL Shape Generator startet...");

    // Geschlechterauswahl-Eventlistener
    const genderSelect = document.getElementById("gender-select");
    if (genderSelect) {
      genderSelect.value = this.selectedGender;
      genderSelect.addEventListener("change", (e) => {
        this.selectedGender = e.target.value;
        this.loadShapePreset("standard");
        this.generateSliders();
        this.updateExport();
        this.updateStats();
        this.loadCustomPresets();
        this.renderPresetButtons();
      });
    }

    // Warte bis Config geladen ist mit Timeout
    const checkConfig = () => {
      this.configCheckAttempts++;

      if (window.SHAPE_PARAMETERS && window.SHAPE_PRESETS) {
        console.log("✅ Config verfügbar");
        console.log(
          "Parameter-Kategorien:",
          Object.keys(window.SHAPE_PARAMETERS[this.selectedGender])
        );
        console.log("Presets:", Object.keys(window.SHAPE_PRESETS[this.selectedGender]));

        this.loadShapePreset("standard");
        this.setupEventListeners();
        this.generateSliders();
        this.updateExport();
        this.updateStats();
        this.loadCustomPresets();
      } else if (this.configCheckAttempts < this.maxConfigAttempts) {
        console.log(
          `⏳ Warte auf Config... (Versuch ${this.configCheckAttempts}/${this.maxConfigAttempts})`
        );
        setTimeout(checkConfig, 100);
      } else {
        console.error("❌ Config konnte nicht geladen werden - Timeout");
        this.showNotification(
          "Konfiguration konnte nicht geladen werden",
          "error"
        );
        // Fallback: Grundlegende UI trotzdem aufbauen
        this.setupEventListeners();
      }
    };

    checkConfig();
  }

  setupEventListeners() {
      console.log('[DEBUG] setupEventListeners() aufgerufen');
    try {
      // Tab Navigation
      document.querySelectorAll(".tab-button").forEach((button) => {
        button.addEventListener("click", (e) => {
          this.switchTab(e.target.dataset.tab);
          if (e.target.dataset.tab === 'presets') {
            this.renderPresetButtons();
          }
        });
      });

      // Preset Buttons dynamisch erzeugen
      const presetGrid = document.querySelector(".preset-grid");
      if (presetGrid) {
        presetGrid.innerHTML = "";
        const genderPresets = window.SHAPE_PRESETS[this.selectedGender] || {};
        Object.keys(genderPresets).forEach((presetId) => {
          const preset = genderPresets[presetId];
          if (!preset || !preset.parameters) return;
          const btn = document.createElement("button");
          btn.className = "preset-btn";
          btn.dataset.preset = presetId;
          btn.textContent = preset.name || presetId;
          btn.addEventListener("click", (e) => {
            this.loadShapePreset(presetId);
          });
          presetGrid.appendChild(btn);
        });
      }
      // Custom Presets werden weiterhin angezeigt
      this.loadCustomPresets();

      // Export Buttons
      const exportButtons = [
        { id: "export-json", format: "json" },
        { id: "export-xml", format: "xml" },
        { id: "export-notecard", format: "notecard" },
        { id: "export-share", format: "share" },
      ];

      exportButtons.forEach((btn) => {
        const element = document.getElementById(btn.id);
        if (element) {
          element.addEventListener("click", () =>
            this.exportShape(btn.format)
          );
        }
      });

      // Control Buttons
      const controlButtons = [
        { id: "reset-preview", action: () => this.resetShape() },
        { id: "random-shape", action: () => this.generateRandomShape() },
        { id: "toggle-grid", action: () => this.toggleGrid() },
        { id: "save-preset", action: () => this.saveCustomPreset() },
        { id: "copy-export", action: () => this.copyToClipboard() },
        { id: "download-export", action: () => this.downloadExport() },
      ];

      controlButtons.forEach((btn) => {
        const element = document.getElementById(btn.id);
        if (element) {
          element.addEventListener("click", btn.action);
        }
      });

      // Inputs
      const shapeNameInput = document.getElementById("shape-name");
      const presetNameInput = document.getElementById("preset-name");

      if (shapeNameInput) {
        shapeNameInput.addEventListener("input", () => this.updateExport());
      }

      if (presetNameInput) {
        presetNameInput.addEventListener("keypress", (e) => {
          if (e.key === "Enter") this.saveCustomPreset();
        });
      }

      console.log("✅ Event Listeners setup abgeschlossen");
    } catch (error) {
      console.error("❌ Fehler beim Setup der Event Listeners:", error);
    }
  }

  switchTab(tabName) {
      console.log(`[DEBUG] switchTab() aufgerufen mit Tab: ${tabName}`);
    try {
      // Update Tab Buttons
      document.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
      });
      // Update Tab Content
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.toggle("active", pane.id === `${tabName}-tab`);
      });
      if (tabName === 'presets') {
        this.renderPresetButtons();
      }
    } catch (error) {
      console.error("Fehler beim Tab-Wechsel:", error);
    }
  }

  generateSliders() {
      console.log('[DEBUG] generateSliders() aufgerufen');
    if (!window.SHAPE_PARAMETERS || !window.SHAPE_PARAMETERS[this.selectedGender]) {
      console.error("❌ SHAPE_PARAMETERS für das gewählte Geschlecht nicht verfügbar!");
      this.showNotification("Shape-Parameter nicht geladen", "error");
      return;
    }

    try {
      Object.keys(window.SHAPE_PARAMETERS[this.selectedGender]).forEach((category) => {
        const container = document.getElementById(`${category}-tab`);
        if (!container) {
          console.warn(`Container nicht gefunden: ${category}-tab`);
          return;
        }

        // Container leeren
        container.innerHTML = "";

        let params = window.SHAPE_PARAMETERS[this.selectedGender][category];
        params.forEach((param) => {
          const sliderGroup = this.createSlider(param);
          container.appendChild(sliderGroup);
        });
      });
      console.log("✅ Slider generiert für alle Kategorien");
    } catch (error) {
      console.error("❌ Fehler beim Generieren der Slider:", error);
      this.showNotification("Fehler beim Erstellen der Slider", "error");
    }
  }

  createSlider(param) {
      //console.log(`[DEBUG] createSlider() für Parameter: ${param.id}`);
    const currentValue =
      this.currentShape[param.id] !== undefined
        ? this.currentShape[param.id]
        : param.default;

    const group = document.createElement("div");
    group.className = "slider-group";
    group.innerHTML = `
          <div class="slider-label">
              <span>${param.name}</span>
              <span class="slider-value" id="value-${param.id}">${currentValue}</span>
          </div>
          <div class="slider-container">
              <input type="range" 
                     class="range-slider" 
                     id="slider-${param.id}"
                     min="${param.min}" 
                     max="${param.max}" 
                     value="${currentValue}"
                     data-param="${param.id}">
              <div class="slider-ticks">
                  <span>${param.min}</span>
                  <span>${Math.round((param.min + param.max) / 2)}</span>
                  <span>${param.max}</span>
              </div>
          </div>
      `;

    // Event Listener für Slider
    const slider = group.querySelector(`#slider-${param.id}`);
    slider.addEventListener("input", (e) => {
      this.updateParameter(e.target.dataset.param, parseInt(e.target.value));
    });

    return group;
  }

  updateParameter(paramId, value) {
      console.log(`[DEBUG] updateParameter() aufgerufen für ${paramId} mit Wert ${value}`);
    try {
      this.currentShape[paramId] = value;

      // Update Anzeige
      const valueDisplay = document.getElementById(`value-${paramId}`);
      if (valueDisplay) {
        valueDisplay.textContent = value;
      }

      // Background Section highlighten
      if (window.backgroundManager) {
        window.backgroundManager.highlightRelatedSection(paramId);
      }

      // Update 3D Vorschau
      this.updatePreview();

      // Update Export
      this.updateExport();

      // Stats aktualisieren
      this.updateStats();

      // Custom Event für andere Komponenten
      this.dispatchSliderChange(paramId, value);
    } catch (error) {
      console.error(`Fehler beim Update von Parameter ${paramId}:`, error);
    }
  }

  dispatchSliderChange(paramId, value) {
    const event = new CustomEvent("sliderChange", {
      detail: { parameter: paramId, value: value },
    });
    document.dispatchEvent(event);
  }

  loadShapePreset(presetId) {
      console.log(`[DEBUG] loadShapePreset() aufgerufen mit Preset: ${presetId}`);
    try {
      console.log("Lade Preset:", presetId);
      let preset;
      // Prüfen ob es ein custom preset ist
      if (this.customPresets[presetId]) {
        preset = this.customPresets[presetId];
        console.log("Custom Preset geladen:", preset);
      } else if (
        window.SHAPE_PRESETS &&
        window.SHAPE_PRESETS[this.selectedGender] &&
        window.SHAPE_PRESETS[this.selectedGender][presetId]
      ) {
        preset = window.SHAPE_PRESETS[this.selectedGender][presetId];
      }
      if (!preset || !preset.parameters) {
        this.showNotification(`Ungültiges Preset: ${presetId}`, 'error');
        return;
      }
      // Shape Daten laden
      this.currentShape = { ...preset.parameters };
      console.log("Aktuelle Shape-Daten:", this.currentShape);
      // Slider und Werte komplett neu generieren
      this.generateSliders();
      // Shape Name setzen falls vorhanden
      const shapeNameInput = document.getElementById("shape-name");
      if (shapeNameInput) {
        shapeNameInput.value = preset.name || presetId;
      }
      this.updatePreview();
      this.updateExport();
      this.updateStats();
      this.showNotification(`Preset \"${preset.name || presetId}\" geladen`);
    } catch (error) {
      console.error("Fehler beim Laden des Presets:", error);
      this.showNotification("Fehler beim Laden des Presets", "error");
    }
  }

  resetShape() {
      console.log('[DEBUG] resetShape() aufgerufen');
    if (!window.SHAPE_PARAMETERS || !window.SHAPE_PARAMETERS[this.selectedGender]) {
      this.showNotification("Konfiguration nicht geladen", "error");
      return;
    }
    // Auf Standardwerte zurücksetzen für das gewählte Geschlecht
    Object.keys(window.SHAPE_PARAMETERS[this.selectedGender]).forEach((category) => {
      window.SHAPE_PARAMETERS[this.selectedGender][category].forEach((param) => {
        this.updateParameter(param.id, param.default);
      });
    });
    const shapeNameInput = document.getElementById("shape-name");
    if (shapeNameInput) {
      shapeNameInput.value = "Mein Avatar Shape";
    }
    this.showNotification("Shape zurückgesetzt");
  }

  generateRandomShape() {
      console.log('[DEBUG] generateRandomShape() aufgerufen');
    if (!window.SHAPE_PARAMETERS || !window.SHAPE_PARAMETERS[this.selectedGender]) {
      this.showNotification("Konfiguration nicht geladen", "error");
      return;
    }
    Object.keys(window.SHAPE_PARAMETERS[this.selectedGender]).forEach((category) => {
      window.SHAPE_PARAMETERS[this.selectedGender][category].forEach((param) => {
        const randomValue =
          Math.floor(Math.random() * (param.max - param.min + 1)) +
          param.min;
        this.updateParameter(param.id, randomValue);
      });
    });
    const shapeNameInput = document.getElementById("shape-name");
    if (shapeNameInput) {
      shapeNameInput.value = "Zufälliger Shape";
    }
    this.showNotification("Zufälliger Shape generiert");
  }

  saveCustomPreset() {
      console.log('[DEBUG] saveCustomPreset() aufgerufen');
    try {
      const presetNameInput = document.getElementById("preset-name");
      if (!presetNameInput) return;

      const presetName = presetNameInput.value.trim();
      if (!presetName) {
        this.showNotification(
          "Bitte einen Namen für das Preset eingeben",
          "error"
        );
        return;
      }
      // Preset speichern
      this.customPresets[presetName] = {
        name: presetName,
        parameters: { ...this.currentShape }
      };
      localStorage.setItem("customPresets", JSON.stringify(this.customPresets));
      this.loadCustomPresets();
      this.showNotification(`Preset "${presetName}" gespeichert`);
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      this.showNotification("Fehler beim Speichern", "error");
    }
    }


  loadCustomPresets() {
      console.log('[DEBUG] loadCustomPresets() aufgerufen');
    try {
      const container = document.getElementById("custom-presets-list");
      if (!container) return;

      container.innerHTML = "";

      Object.keys(this.customPresets).forEach((presetId) => {
        const preset = this.customPresets[presetId];
        const button = document.createElement("button");
        button.className = "preset-btn custom-preset";
        button.textContent = preset.name;
        button.dataset.preset = presetId;

        button.addEventListener("click", (e) => {
          this.loadShapePreset(e.target.dataset.preset);
        });

        // Löschen Button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-preset";
        deleteBtn.innerHTML = "×";
        deleteBtn.title = "Preset löschen";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.deleteCustomPreset(presetId);
        });

        button.appendChild(deleteBtn);
        container.appendChild(button);
      });
    } catch (error) {
      console.error("Fehler beim Laden der Custom Presets:", error);
    }
  }

  deleteCustomPreset(presetId) {
      console.log(`[DEBUG] deleteCustomPreset() aufgerufen für ${presetId}`);
    try {
      if (
        confirm(
          `Preset "${this.customPresets[presetId].name}" wirklich löschen?`
        )
      ) {
        delete this.customPresets[presetId];
        localStorage.setItem(
          "customPresets",
          JSON.stringify(this.customPresets)
        );
        this.loadCustomPresets();
        this.showNotification("Preset gelöscht");
      }
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      this.showNotification("Fehler beim Löschen", "error");
    }
  }

  toggleGrid() {
      console.log('[DEBUG] toggleGrid() aufgerufen');
    try {
      const sections = document.querySelector(".avatar-sections");
      if (sections) {
        sections.classList.toggle("hidden");
        this.showNotification(
          `Grid ${sections.classList.contains("hidden") ? "aus" : "an"}`
        );
      }
    } catch (error) {
      console.error("Fehler beim Toggle Grid:", error);
    }
  }

  updatePreview() {
      console.log('[DEBUG] updatePreview() aufgerufen');
    try {
      // 3D Vorschau aktualisieren
      if (window.avatarPreview) {
        window.avatarPreview.updateShape(this.currentShape);
      }
    } catch (error) {
      console.error("Fehler beim Update Preview:", error);
    }
  }

  updateExport() {
      console.log('[DEBUG] updateExport() aufgerufen');
    try {
      // Exportiere IMMER alle Parameter (auch unveränderte)
      let exportData = {};
      if (window.SHAPE_PARAMETERS && window.SHAPE_PARAMETERS[this.selectedGender]) {
        const genderParams = window.SHAPE_PARAMETERS[this.selectedGender];
        Object.keys(genderParams).forEach((category) => {
          genderParams[category].forEach((param) => {
            exportData[param.id] = this.currentShape[param.id] !== undefined
              ? this.currentShape[param.id]
              : param.default;
          });
        });
      }
      // Zeige die Exportdaten direkt im Textfeld
      const output = document.getElementById("export-output");
      if (output) {
        output.value = JSON.stringify(exportData, null, 2);
      }
      // Export Vorschau aktualisieren
      if (window.shapeExporter) {
        window.shapeExporter.updatePreview(exportData);
      }
    } catch (error) {
      console.error("Fehler beim Update Export:", error);
    }
  }

  updateStats() {
      console.log('[DEBUG] updateStats() aufgerufen');
    try {
      // Statistiken aktualisieren
      const activeParams = Object.keys(this.currentShape).length;
      const activeParamsElement = document.getElementById("active-params");
      const paramCountElement = document.getElementById("param-count");
      const lastChangeElement = document.getElementById("last-change");

      if (activeParamsElement) activeParamsElement.textContent = activeParams;
      if (paramCountElement)
        paramCountElement.textContent = `${activeParams} Parameter`;
      if (lastChangeElement)
        lastChangeElement.textContent = new Date().toLocaleTimeString();
    } catch (error) {
      console.error("Fehler beim Update Stats:", error);
    }
  }

  exportShape(format) {
    // Fallback: Initialisiere window.shapeExporter, falls nicht vorhanden
    if (!window.shapeExporter && typeof window.ShapeExporter !== 'undefined') {
      window.shapeExporter = new window.ShapeExporter();
      console.log('[DEBUG] Fallback: window.shapeExporter initialisiert');
    }
    console.log(`[DEBUG] exportShape() aufgerufen mit Format: ${format}`);
    let attempts = 0;
    const tryExport = () => {
      console.log(`[DEBUG] tryExport() Versuch ${attempts}, window.shapeExporter:`, window.shapeExporter);
      if (window.shapeExporter) {
        console.log('[DEBUG] Export-System verfügbar, starte Export...');
        const shapeNameInput = document.getElementById("shape-name");
        const shapeName = shapeNameInput
          ? shapeNameInput.value
          : "Unbenannter Shape";
        // Exportiere IMMER alle Parameter (auch unveränderte)
        let exportData = {};
        const genderParams = window.SHAPE_PARAMETERS[this.selectedGender];
        Object.keys(genderParams).forEach((category) => {
          genderParams[category].forEach((param) => {
            exportData[param.id] = this.currentShape[param.id] !== undefined
              ? this.currentShape[param.id]
              : param.default;
          });
        });
        window.shapeExporter.exportShape(exportData, format, shapeName);
      } else if (attempts < 10) {
        attempts++;
        console.log(`[DEBUG] Export-System noch nicht verfügbar, retry in 100ms (Versuch ${attempts})`);
        setTimeout(tryExport, 100);
      } else {
        console.log('[DEBUG] Export-System nach 10 Versuchen nicht verfügbar. Abbruch.');
        this.showNotification("Export-System nicht verfügbar", "error");
      }
    };
    try {
      tryExport();
    } catch (error) {
      console.error("Fehler beim Export:", error);
      this.showNotification("Fehler beim Export", "error");
    }
  }

  copyToClipboard() {
      console.log('[DEBUG] copyToClipboard() aufgerufen');
    try {
      const output = document.getElementById("export-output");
      if (output && output.value) {
        output.select();
        output.setSelectionRange(0, 99999); // Für Mobile
        try {
          document.execCommand("copy");
          this.showNotification("In Zwischenablage kopiert");
        } catch (err) {
          this.showNotification("Kopieren fehlgeschlagen", "error");
        }
      } else {
        this.showNotification("Keine Export-Daten verfügbar", "error");
      }
    } catch (error) {
      console.error("Fehler beim Kopieren:", error);
      this.showNotification("Fehler beim Kopieren", "error");
    }
  }

  downloadExport() {
      console.log('[DEBUG] downloadExport() aufgerufen');
    try {
      const output = document.getElementById("export-output");
      if (output && output.value) {
        const shapeNameInput = document.getElementById("shape-name");
        const shapeName = shapeNameInput
          ? shapeNameInput.value
          : "avatar_shape";
        const sanitizedName = shapeName
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        const blob = new Blob([output.value], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${sanitizedName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showNotification("Export heruntergeladen");
      } else {
        this.showNotification("Keine Export-Daten verfügbar", "error");
      }
    } catch (error) {
      console.error("Fehler beim Download:", error);
      this.showNotification("Fehler beim Download", "error");
    }
  }

  showNotification(message, type = "success") {
      console.log(`[DEBUG] showNotification() aufgerufen mit Message: ${message}, Typ: ${type}`);
    try {
      // Fallback für ältere Notification-Implementierung
      const notification = document.getElementById("notification");
      if (notification) {
        const notificationText = document.getElementById("notification-text");
        if (notificationText) {
          notification.className = `notification ${type}`;
          notificationText.textContent = message;
        }
      } else {
        // Fallback: Einfache Notification
        const fallbackNotification = document.createElement("div");
        fallbackNotification.style.cssText = `
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  background: ${type === "error" ? "#e74c3c" : "#2ecc71"};
                  color: white;
                  padding: 15px 20px;
                  border-radius: 5px;
                  z-index: 1000;
                  font-family: Arial, sans-serif;
              `;
        fallbackNotification.textContent = message;
        document.body.appendChild(fallbackNotification);

        setTimeout(() => {
          fallbackNotification.remove();
        }, 3000);
      }
    } catch (error) {
      console.error("Fehler bei Notification:", error);
      // Letzter Fallback: console.log
      console.log(`Notification [${type}]: ${message}`);
    }
  }
} // <-- Ende der Klasse SLShapeGenerator (KORREKTE POSITION)

window.SLShapeGenerator = SLShapeGenerator;

// XML-Import für Second Life Shape
function importShapeFromXML(xmlText, presetName = "XML-Import") {
  try {
    // Parameter kategorisieren und in SHAPE_PARAMETERS einsortieren
    const categorized = categorizeXmlParams(xmlText);
    window.SHAPE_PARAMETERS = categorized;
    // Preset übernehmen (alle Werte als Flat-Objekt für Export)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    const params = xmlDoc.querySelectorAll("param");
    // shapeData: alle Parameter aus Kategorien, mit Defaultwerten falls nicht im XML
    const categorizedParams = Object.values(categorized).flat();
    const shapeData = {};
    categorizedParams.forEach((param) => {
      shapeData[param.id] = param.default;
    });
    // Werte aus XML überschreiben ggf. die Defaults
    params.forEach((param) => {
      const id = param.getAttribute("id");
      const value = param.getAttribute("u8");
      if (id && value) {
        shapeData[id] = parseInt(value, 10);
      }
    });
    if (!window.SHAPE_PRESETS) window.SHAPE_PRESETS = {};
    window.SHAPE_PRESETS[presetName] = {
      name: presetName,
      parameters: shapeData,
    };
    // Status anzeigen
    const status = document.getElementById("xml-import-status");
    if (status) {
      status.textContent = `Preset "${presetName}" erfolgreich importiert und geladen!`;
      status.style.color = "green";
    }
    // UI aktualisieren: Slider neu generieren und Preset laden
    if (window.shapeApp && window.shapeApp.generateSliders)
      window.shapeApp.generateSliders();
    if (window.shapeApp && window.shapeApp.loadShapePreset)
      window.shapeApp.loadShapePreset(presetName);
    if (window.renderCustomPresets) window.renderCustomPresets();
  } catch (e) {
    const status = document.getElementById("xml-import-status");
    if (status) {
      status.textContent = "Fehler beim Import: " + e.message;
      status.style.color = "red";
    }
  }
}

// Event Listener für XML-Import
document.addEventListener("DOMContentLoaded", () => {
  const importBtn = document.getElementById("import-xml-btn");
  const fileInput = document.getElementById("xml-import-file");
  if (importBtn && fileInput) {
    importBtn.addEventListener("click", () => {
      if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          importShapeFromXML(
            e.target.result,
            fileInput.files[0].name.replace(/\.xml$/i, "")
          );
        };
        reader.readAsText(fileInput.files[0]);
      }
    });
  }
});

// Funktion zum Rendern der Presets in der UI
window.renderCustomPresets = function () {
  const list = document.getElementById("custom-presets-list");
  if (!list || !window.shapeApp || !window.shapeApp.customPresets) return;
  list.innerHTML = "";
  Object.keys(window.shapeApp.customPresets).forEach((presetId) => {
    const preset = window.shapeApp.customPresets[presetId];
    const btn = document.createElement("button");
    btn.className = "preset-btn custom-preset";
    btn.textContent = preset.name || presetId;
    btn.dataset.preset = presetId;
    btn.onclick = function () {
      if (window.shapeApp && window.shapeApp.loadShapePreset) {
        window.shapeApp.loadShapePreset(presetId);
      }
    };
    // Löschen Button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-preset";
    deleteBtn.innerHTML = "×";
    deleteBtn.title = "Preset löschen";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      window.shapeApp.deleteCustomPreset(presetId);
    });
    btn.appendChild(deleteBtn);
    list.appendChild(btn);
  });
};

// App initialisieren wenn DOM geladen - nur wenn nicht bereits initialisiert
window.startShapeApp = function() {
  console.log('[DEBUG] Starte window.startShapeApp');
  console.log('[DEBUG] SHAPE_PARAMETERS:', window.SHAPE_PARAMETERS);
  console.log('[DEBUG] SHAPE_PRESETS:', window.SHAPE_PRESETS);
  if (!window.shapeApp) {
    try {
      window.shapeApp = new SLShapeGenerator();
      console.log("📄 SL Shape Generator initialisiert.");
    } catch (error) {
      console.error("❌ Fehler bei der Initialisierung:", error);
    }
  } else {
    console.log("ℹ️ Shape App wurde bereits initialisiert");
  }
};
console.log('[DEBUG] window.startShapeApp ist jetzt im globalen Scope:', typeof window.startShapeApp);

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(window.startShapeApp, 0);
} else {
  document.addEventListener("DOMContentLoaded", window.startShapeApp);
}