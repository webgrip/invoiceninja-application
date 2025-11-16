---
title: "Service Configuration"
description: "Docker Compose service definitions and health check configurations"
tags:
  - configuration
  - services
  - docker-compose
  - health-checks
search:
  boost: 3
  exclude: false
icon: material/application-cog-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Service Configuration

## Application Service

```yaml
Container: invoiceninja-application.application
Image: webgrip/invoiceninja-application.application:latest
Ports: 8080:8080 (HTTP)
Health Check: curl -f http://localhost:8080/health
Dependencies: mariadb, redis
Restart Policy: always
```

**Health Check Configuration:**
- **Endpoint:** `/health`
- **Interval:** 15 seconds
- **Timeout:** 5 seconds
- **Retries:** 10
- **Start Period:** 20 seconds

## MariaDB Service

```yaml
Container: invoiceninja-application.mariadb
Image: webgrip/invoiceninja-application.mariadb:latest
Ports: 3306:3306 (Internal)
Health Check: mariadb --socket=/var/run/mysqld/mysqld.sock --user=${DB_USERNAME} --password=${DB_PASSWORD} --execute=SELECT 1
Restart Policy: unless-stopped
Logging: 10MB max file size
```

**MariaDB Configuration:**
- **Character Set:** utf8mb4
- **Collation:** utf8mb4_unicode_ci
- **Timezone:** UTC
- **Max Connections:** 100 (default)
- **Shared Buffers:** 25% of available RAM

## Redis Service

```yaml
Container: invoiceninja-application.redis
Image: webgrip/invoiceninja-application.redis:latest
Ports: None (Internal only)
Health Check: redis-cli ping
Restart Policy: always
Persistence: Enabled via volume mount
```

**Redis Configuration:**
- **Persistence:** RDB snapshots + AOF logging
- **Memory Policy:** allkeys-lru
- **Max Memory:** 256MB (configurable)
- **Timeout:** 300 seconds

## PostgreSQL Service (Alternative)

```yaml
Container: invoiceninja-application.postgres (commented out by default)
Image: webgrip/invoiceninja-application.postgres:latest
Ports: 5432:5432 (Internal)
Health Check: pg_isready -U ${DB_USERNAME}
Character Set: UTF8
Collation: en_US.utf8
```

## Sources

- **Docker Compose File Reference**, https://docs.docker.com/compose/compose-file/, Retrieved 2025-01-16
- **MariaDB Docker Documentation**, https://hub.docker.com/_/mariadb, Retrieved 2025-01-16
- **PostgreSQL Docker Documentation**, https://hub.docker.com/_/postgres, Retrieved 2025-01-16
- **Redis Configuration Reference**, https://redis.io/docs/latest/operate/oss_and_stack/management/config/, Retrieved 2025-01-16