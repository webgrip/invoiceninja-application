# Invoice Ninja Nginx Reverse Proxy
# Minimal overlay on official Nginx upstream

# Use latest stable minor version of Nginx Alpine  
FROM nginx:1.26.2-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration for Invoice Ninja proxy
COPY ops/docker/nginx/config/default.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose standard HTTP port
EXPOSE 80
