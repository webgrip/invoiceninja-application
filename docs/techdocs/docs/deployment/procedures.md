---
title: "Deployment Procedures"
description: "Step-by-step deployment process for the Invoice Ninja application"
tags:
  - deployment
  - procedures
  - quickstart
  - production
search:
  boost: 4
  exclude: false
icon: material/play-circle-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Deployment Procedures

## Quick Start Deployment

For development or testing environments:

```bash
# Start all services
make start

# Verify services are healthy
docker-compose ps

# Follow logs
make logs

# Access the application
# Navigate to http://localhost:8080
```

## Production Deployment

### 1. Pre-deployment Verification

```bash
# Verify configuration
docker-compose config

# Check image availability
docker-compose pull --ignore-pull-failures

# Verify external network exists
docker network inspect webgrip
```

### 2. Database Initialization

```bash
# Start database first
docker-compose up -d invoiceninja-application.mariadb

# Wait for database to be ready
make wait-ready URL=http://localhost:3306

# Verify database connectivity
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --execute="SELECT 1"
```

### 3. Application Deployment

```bash
# Start all services
make start

# Monitor startup
make logs SERVICE=invoiceninja-application.application

# Wait for application readiness
make wait-ready URL=http://localhost:8080/health
```

### 4. Initial Configuration

```bash
# Create admin user (customize command for Invoice Ninja)
make user:create EMAIL=admin@yourcompany.com PASS=initial-password

# Access the application and complete setup wizard
# Navigate to http://localhost:8080/setup
```

## Service Management

```bash
# Start services
make start

# Stop services
make stop

# View logs (all services)
make logs

# View logs (specific service)
make logs SERVICE=invoiceninja-application.application

# Execute commands in application container
make enter
# Or with specific command
make run CMD="php artisan migrate:status"

# Health check
curl -f http://localhost:8080/health
```

## Next Steps

After successful deployment:
- Proceed to [Operations](../operations/) for day-to-day management
- See [Troubleshooting](../troubleshooting/) for common issues
- Review [Production Considerations](production.md) for production deployments