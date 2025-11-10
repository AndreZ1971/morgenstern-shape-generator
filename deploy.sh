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
