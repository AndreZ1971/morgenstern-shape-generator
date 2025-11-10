const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const redis = require('redis');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Redis Client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// Multer für File Uploads (KI Image Analysis)
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Shape Presets Management
app.get('/api/presets', async (req, res) => {
  try {
    const presets = await redisClient.get('shape-presets');
    res.json(JSON.parse(presets || '[]'));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

app.post('/api/presets', async (req, res) => {
  try {
    const { name, parameters } = req.body;
    const preset = { id: Date.now(), name, parameters, created: new Date() };
    
    const presets = JSON.parse(await redisClient.get('shape-presets') || '[]');
    presets.push(preset);
    
    await redisClient.set('shape-presets', JSON.stringify(presets));
    res.json(preset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save preset' });
  }
});

// KI Image Analysis Endpoint
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    // Platzhalter für KI Image Analysis
    // Hier kommt später TensorFlow.js Integration
    const analysisResult = {
      detected_shape: {
        body_height: 65,
        body_fat: 35,
        body_muscle: 60,
        // ... weitere Parameter basierend auf Bildanalyse
      },
      confidence: 0.78,
      processing_time: '2.3s'
    };
    
    res.json(analysisResult);
  } catch (error) {
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Text-to-Shape Generation
app.post('/api/generate-from-text', async (req, res) => {
  try {
    const { description } = req.body;
    
    // Platzhalter für NLP/KI Text Analysis
    const generatedShape = {
      parameters: {
        body_height: 60,
        body_fat: 30,
        body_muscle: 70,
        // ... basierend auf Textbeschreibung
      },
      description: description,
      generated_at: new Date().toISOString()
    };
    
    res.json(generatedShape);
  } catch (error) {
    res.status(500).json({ error: 'Shape generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SL Shape API running on port ${PORT}`);
});
