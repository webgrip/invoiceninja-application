# Invoice Ninja Application Dockerfile
# Minimal overlay on official Invoice Ninja upstream image

# Use latest stable Invoice Ninja image
FROM invoiceninja/invoiceninja:5

# Install curl for health checks (minimal overlay)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Expose port (Invoice Ninja runs on port 80)
EXPOSE 80

# Health check using Invoice Ninja's built-in health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1