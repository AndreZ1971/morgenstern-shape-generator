# Einfaches Nginx-Image für statische Dateien
FROM nginx:alpine

# Statische Web-App kopieren
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
