# Multi-Stage Build für Production
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production Stage
FROM nginx:alpine

# Build der Web App kopieren
COPY --from=builder /app /usr/share/nginx/html
COPY . /usr/share/nginx/html

# Nginx Configuration
COPY nginx.conf /etc/nginx/nginx.conf

# SSL Support (optional)
RUN mkdir -p /etc/nginx/ssl

EXPOSE 80 443

# Health Check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
