FROM invoiceninja/invoiceninja:5.12.26

# Expose port (Invoice Ninja runs on port 80)
EXPOSE 80

# Health check using Invoice Ninja's built-in health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1
