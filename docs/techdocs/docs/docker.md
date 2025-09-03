# Docker Infrastructure

This document describes the complete Docker infrastructure setup for the invoiceninja-application project, implementing a self-maintained image policy with containerization best practices.

## Overview

The application uses a multi-service Docker architecture with the following components:

- **Application**: Invoice Ninja v5.x (Laravel-based invoicing and billing platform)
- **Nginx**: Reverse proxy with SSL termination
- **MariaDB**: Primary database service
- **Redis**: Caching and session storage
- **PostgreSQL**: Alternative database option (disabled by default)
- **mkcert**: SSL certificate generation for local development

## Architecture Principles

### Self-Maintained Image Policy

All services follow the **own every image** policy:

- ✅ **Org-owned images**: All services use `webgrip/invoiceninja-application.{service}` naming
- ✅ **Upstream base images**: Built FROM official images with exact pinned tags
- ✅ **Minimal overlay**: Only essential additions, no unnecessary packages
- ✅ **Compose isolation**: docker-compose.yml references only our images
- ✅ **Port hygiene**: Only reverse proxy publishes host ports
- ✅ **Reproducibility**: Clean clone → make start → working stack

### Security Best Practices

- **Non-root users**: All services run with appropriate user permissions
- **Internal networking**: Services communicate via internal Docker networks
- **Health checks**: Comprehensive monitoring for all services
- **Minimal attack surface**: Only essential packages included in images

## Service Configuration

### Application Service

**Base Image**: `invoiceninja/invoiceninja:5`
**Port**: 80 (internal only)
**Health Check**: `curl -f http://localhost:80/health`

```dockerfile
FROM invoiceninja/invoiceninja:5

# Add curl for health checks (minimal overlay)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1
```

### Nginx Reverse Proxy

**Base Image**: `nginx:1.26.2-alpine`
**Port**: 80 (published to 127.0.0.1:8080)
**Configuration**: Custom reverse proxy setup

Key features:
- Reverse proxy to Invoice Ninja application
- Health check endpoint forwarding
- Optimized nginx configuration for Laravel/PHP-FPM backends

### Database Services

#### MariaDB (Primary)

**Base Image**: `mariadb:11.6.2-noble`
**Port**: 3306 (internal only)
**Features**:
- UTF8MB4 character set with Unicode collation
- Optimized startup configuration
- Persistent data volumes

#### PostgreSQL (Alternative)

**Base Image**: `postgres:17.2-alpine`
**Port**: 5432 (internal only)
**Status**: Commented out by default, can be enabled as needed

### Redis Cache

**Base Image**: `redis:7.4.2-alpine`
**Port**: 6379 (internal only)
**Configuration**: Standard Redis setup with persistence

### mkcert SSL Certificates

**Base Image**: `alpine:3.20`
**Purpose**: Generate local SSL certificates for development
**Run Policy**: `restart: "no"` (runs once to generate certificates)

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Make utility available
- Git repository cloned

### Starting the Stack

```bash
# Start all services
make start

# Verify services are healthy
docker compose ps

# Check application
curl http://localhost:8080/
curl http://localhost:8080/health
```

### Stopping the Stack

```bash
# Stop all services
make stop

# Or stop with cleanup
docker compose down --remove-orphans --volumes
```

## Docker Compose Configuration

### Service Dependencies

The services start in the following order:

1. **MariaDB** and **Redis** (parallel startup)
2. **Application** (depends on healthy database and cache)
3. **Nginx** (depends on healthy application)
4. **mkcert** (independent, runs once)

### Health Checks

All services implement comprehensive health checks:

```yaml
# Application health check
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
  interval: 15s
  timeout: 5s
  retries: 10
  start_period: 20s

# MariaDB health check
healthcheck:
  test: ["CMD", "mariadb", "--socket=/var/run/mysqld/mysqld.sock", ...]
  interval: 10s
  timeout: 5s
  retries: 10
  start_period: 30s
```

### Volumes

Persistent data is stored in named volumes:

- `invoiceninja-application-application-data`: Application data
- `invoiceninja-application-mariadb-data`: Database data
- `invoiceninja-application-redis-data`: Redis persistence
- `invoiceninja-application-mkcert-data`: SSL certificates

### Environment Configuration

Services are configured via environment variables from `.env` file:

```bash
# Database configuration
DB_DATABASE=invoiceninja
DB_USERNAME=invoiceninja
DB_PASSWORD=secret
DB_ROOT_PASSWORD=rootsecret

# Application configuration
SUBDOMAIN=invoiceninja-application
DOMAIN_NAME=webgrip.test
TZ=UTC
```

## Networking

### Port Configuration

- **External Access**: Only nginx publishes to host (127.0.0.1:8080)
- **Internal Communication**: All services use internal Docker networking
- **Security**: No direct external access to databases or application

### Network Topology

```
Internet → nginx:80 (127.0.0.1:8080) → application:8080
                                    ↓
                        mariadb:3306 + redis:6379
```

## Development Workflow

### Making Changes

1. **Code Changes**: Modify source files
2. **Rebuild**: `docker compose up --build`
3. **Test**: Verify application functionality
4. **Debug**: Use `make logs` or `make enter` for troubleshooting

### Debugging

```bash
# View all logs
make logs

# View specific service logs
make logs SERVICE=invoiceninja-application.application

# Enter application container
make enter

# Run commands in container
make run CMD="npm test"
```

### Customization

To customize the setup:

1. **Environment**: Modify `.env` file
2. **Configuration**: Update service Dockerfiles in `ops/docker/`
3. **Services**: Adjust `docker-compose.yml`
4. **Networking**: Modify port mappings or network settings

## Makefile Integration

The project includes a comprehensive Makefile with Docker lifecycle management:

### Core Commands

```bash
make start    # Start all services
make stop     # Stop all services
make logs     # Follow logs
make enter    # Exec into application container
make run      # Run command in new container
```

### Compatibility

The Makefile supports both `docker-compose` and `docker compose` commands automatically.

## Image Building

### Build Process

Each service builds from its respective Dockerfile:

```bash
# Application
ops/docker/application/Dockerfile

# Nginx
ops/docker/nginx/Dockerfile

# Database
ops/docker/mariadb/Dockerfile

# Cache
ops/docker/redis/Dockerfile

# SSL
ops/docker/mkcert/Dockerfile
```

### Build Optimization

- **Multi-stage builds**: Where applicable for size optimization
- **Layer caching**: Optimized instruction order for build speed
- **Minimal base images**: Alpine variants for smaller footprint
- **Security scanning**: Regular vulnerability assessments

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check service status
docker compose ps

# View service logs
make logs SERVICE=service-name

# Check health status
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

#### Database Connection Issues

```bash
# Verify database is running
make logs SERVICE=invoiceninja-application.mariadb

# Check network connectivity
docker compose exec invoiceninja-application.application ping invoiceninja-application.mariadb
```

#### Performance Issues

```bash
# Monitor resource usage
docker stats

# Check disk space
docker system df

# Clean up unused resources
docker system prune
```

### Health Check Failures

If health checks are failing:

1. **Check logs**: `make logs SERVICE=failing-service`
2. **Verify configuration**: Ensure environment variables are correct
3. **Test manually**: `make enter` and test connectivity
4. **Restart service**: `docker compose restart service-name`

## Production Considerations

### Image Registry

For production deployment:

1. **Build images**: `docker compose build`
2. **Tag images**: `docker tag local/image registry/image:tag`
3. **Push images**: `docker push registry/image:tag`
4. **Deploy**: Update production compose files with registry references

### Security Hardening

- **Secrets management**: Use external secrets management
- **Network policies**: Implement network segmentation
- **Resource limits**: Set appropriate CPU/memory limits
- **Update strategy**: Regular base image updates

### Monitoring

- **Health endpoints**: Monitor `/health` endpoints
- **Resource metrics**: Track CPU, memory, disk usage
- **Log aggregation**: Centralize log collection
- **Alerting**: Set up alerts for service failures

## Related Documentation

- [Development Guide](development.md)
- [Deployment Guide](deployment.md)
- [Configuration Reference](configuration.md)
- [Troubleshooting Guide](troubleshooting.md)