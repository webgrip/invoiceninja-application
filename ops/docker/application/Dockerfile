# Invoice Ninja Application Dockerfile
# Node.js application with minimal overlay on official upstream

# Use latest LTS minor version of Node.js Alpine
FROM node:20.11.1-alpine AS base

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Add application user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S app -u 1001

# Copy package files
COPY package*.json ./

# Install dependencies (handle case where no lockfile exists)
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev && npm cache clean --force; \
    else \
      npm install --omit=dev && npm cache clean --force; \
    fi

# Copy application source
COPY --chown=app:nodejs src/ ./src/

# Set user
USER app

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start application
CMD ["node", "src/index.js"]