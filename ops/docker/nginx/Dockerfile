# Invoice Ninja Nginx Reverse Proxy
# Minimal overlay on official Nginx upstream

# Use latest stable minor version of Nginx Alpine  
FROM nginx:1.31.0-alpine@sha256:2f07d83bf561b506400dc183b1b2003803e39efbd22451f848adaba14d28c7c7

# Install curl for health checks
RUN apk add --no-cache curl

# Copy nginx configuration for Invoice Ninja proxy
COPY ops/docker/nginx/config/default.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Expose standard HTTP port
EXPOSE 80
