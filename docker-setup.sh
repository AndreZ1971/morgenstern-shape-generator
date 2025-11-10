#!/bin/bash

# Docker Setup für SL Shape Generator
echo "🐳 Erstelle Docker Setup für SL Shape Generator..."

# Dockerfile erstellen
cat > Dockerfile << 'EOF'
# Multi-Stage Build für Production
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production Stage
FROM nginx:alpine

# Build der Web App kopieren
COPY --from=builder /app /usr/share/nginx/html
COPY ./src /usr/share/nginx/html

# Nginx Configuration
COPY nginx.conf /etc/nginx/nginx.conf

# SSL Support (optional)
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

# Health Check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
EOF

# Docker Compose für Development
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  sl-shape-generator:
    build: .
    container_name: sl-shape-generator
    ports:
      - "8080:80"
      - "8443:443"
    volumes:
      - ./src:/usr/share/nginx/html
      - ./logs:/var/log/nginx
    environment:
      - NODE_ENV=production
      - API_URL=${API_URL:-http://localhost:3000}
    restart: unless-stopped
    networks:
      - sl-shape-network

  # Backend API für zukünftige KI-Features
  sl-shape-api:
    image: node:18-alpine
    container_name: sl-shape-api
    working_dir: /app
    ports:
      - "3000:3000"
    volumes:
      - ./api:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    command: npm run dev
    networks:
      - sl-shape-network

  # Redis für Session/Cache
  redis:
    image: redis:7-alpine
    container_name: sl-shape-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - sl-shape-network

  # Database für User-Presets (optional)
  database:
    image: postgres:15-alpine
    container_name: sl-shape-db
    environment:
      - POSTGRES_DB=shapegenerator
      - POSTGRES_USER=shapeuser
      - POSTGRES_PASSWORD=shapepass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sl-shape-network

  # Monitoring mit Grafana/Prometheus
  monitoring:
    image: prom/prometheus:latest
    container_name: sl-shape-monitoring
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - sl-shape-network

volumes:
  redis_data:
  postgres_data:

networks:
  sl-shape-network:
    driver: bridge
EOF

# Nginx Configuration
cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    server {
        listen 80;
        listen [::]:80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        # Client Side Routing Support
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API Proxy für Backend
        location /api/ {
            proxy_pass http://sl-shape-api:3000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # Static Assets Caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health Check Endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Package.json für Backend API
mkdir -p api
cat > api/package.json << 'EOF'
{
  "name": "sl-shape-api",
  "version": "1.0.0",
  "description": "Backend API für SL Shape Generator",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^6.0.0",
    "redis": "^4.6.0",
    "multer": "^1.4.5",
    "@tensorflow/tfjs-node": "^4.10.0",
    "sharp": "^0.32.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  }
}
EOF

# Backend API Server
cat > api/server.js << 'EOF'
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
EOF

# Docker Production Optimierungen
cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
Dockerfile
docker-compose.yml
.env
.nyc_output
coverage
.logs
uploads
EOF

# Environment Configuration
cat > .env.example << 'EOF'
# SL Shape Generator Environment Variables
NODE_ENV=production
API_URL=http://localhost:3000
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://shapeuser:shapepass@database:5432/shapegenerator

# KI/ML Services (für später)
TENSORFLOW_MODEL_URL=/models/shape-predictor
OPENAI_API_KEY=your_openai_key_here

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=https://yourdomain.com
EOF

# Deployment Script
cat > deploy.sh << 'EOF'
#!/bin/bash

# SL Shape Generator Deployment Script
echo "🚀 Deploying SL Shape Generator..."

# Environment prüfen
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Using .env.example..."
    cp .env.example .env
fi

# Docker Images bauen
echo "📦 Building Docker images..."
docker-compose build

# Services starten
echo "🐳 Starting services..."
docker-compose up -d

# Health Check
echo "🔍 Checking service health..."
sleep 10
curl -f http://localhost:8080/health || echo "❌ Frontend not ready"
curl -f http://localhost:3000/api/health || echo "❌ API not ready"

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔗 API: http://localhost:3000"
echo "📊 Monitoring: http://localhost:9090"
EOF

chmod +x deploy.sh

# Monitoring Configuration
mkdir -p monitoring
cat > monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sl-shape-generator'
    static_configs:
      - targets: ['sl-shape-api:3000']
    metrics_path: '/api/metrics'

  - job_name: 'nginx'
    static_configs:
      - targets: ['sl-shape-generator:80']
    metrics_path: '/nginx-status'
EOF

echo "✅ Docker Setup komplett!"
echo ""
echo "🐳 Verfügbare Commands:"
echo "   docker-compose up -d          # Alles starten"
echo "   docker-compose down           # Alles stoppen"
echo "   ./deploy.sh                   # Deployment Script"
echo ""
echo "🌐 Ports:"
echo "   Frontend: http://localhost:8080"
echo "   API:      http://localhost:3000"
echo "   Monitoring: http://localhost:9090"