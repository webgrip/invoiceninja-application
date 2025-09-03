# Configuration

**Purpose Statement:** This document enumerates all required environment variables, volume mounts, and service settings for the Invoice Ninja application deployment.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Volume Mounts and Persistence](#volume-mounts-and-persistence)
- [Service Configuration](#service-configuration)
- [Network Configuration](#network-configuration)
- [Security Configuration](#security-configuration)

## Environment Variables

All configuration follows Laravel convention with `.env` file or environment variable injection.

### Required Environment Variables

| Variable | Purpose | Default | Constraints |
|----------|---------|---------|-------------|
| `APP_KEY` | Laravel application encryption key | *Must be generated* | 32-character base64 string |
| `APP_URL` | Base URL for the application | `http://localhost` | Must include protocol |
| `DB_HOST` | Database server hostname | `invoiceninja-application.mariadb` | Resolvable hostname |
| `DB_DATABASE` | Database name | `invoiceninja` | Must exist or be creatable |
| `DB_USERNAME` | Database username | `invoiceninja` | Must have full privileges |
| `DB_PASSWORD` | Database password | *Required* | Strong password recommended |

### Application Configuration

| Variable | Purpose | Default | Options |
|----------|---------|---------|---------|
| `APP_ENV` | Application environment | `production` | `local`, `staging`, `production` |
| `APP_DEBUG` | Enable debug mode | `false` | `true`, `false` (never true in production) |
| `APP_LOCALE` | Default application locale | `en` | ISO 639-1 language codes |
| `APP_TIMEZONE` | Application timezone | `UTC` | PHP timezone identifiers |
| `SUBDOMAIN` | Application subdomain | `invoiceninja-application` | DNS-safe string |
| `DOMAIN_NAME` | Primary domain | `webgrip.test` | Valid domain name |

### Database Configuration

| Variable | Purpose | Default | Constraints |
|----------|---------|---------|-------------|
| `DB_CONNECTION` | Database driver | `mysql` | `mysql`, `pgsql`, `mariadb` |
| `DB_PORT` | Database port | `3306` | 1-65535 |
| `DB_ROOT_PASSWORD` | Root database password | *Required for initialization* | MariaDB/MySQL only |

### Cache and Session Configuration

| Variable | Purpose | Default | Options |
|----------|---------|---------|---------|
| `CACHE_DRIVER` | Cache backend | `redis` | `redis`, `database`, `file` |
| `SESSION_DRIVER` | Session storage | `redis` | `redis`, `database`, `file` |
| `REDIS_HOST` | Redis server hostname | `invoiceninja-application.redis` | Resolvable hostname |
| `REDIS_PORT` | Redis server port | `6379` | 1-65535 |
| `REDIS_PASSWORD` | Redis authentication | *(empty)* | Optional, but recommended |
| `REDIS_DB` | Redis database number | `0` | 0-15 |

### Queue Configuration

| Variable | Purpose | Default | Options |
|----------|---------|---------|---------|
| `QUEUE_CONNECTION` | Queue backend | `redis` | `redis`, `database`, `sync` |
| `QUEUE_DRIVER` | Legacy queue setting | `redis` | Same as QUEUE_CONNECTION |

### Mail Configuration

| Variable | Purpose | Default | Required for Production |
|----------|---------|---------|-------------------------|
| `MAIL_MAILER` | Mail driver | `smtp` | Yes |
| `MAIL_HOST` | SMTP server | *(empty)* | Yes |
| `MAIL_PORT` | SMTP port | `587` | Yes |
| `MAIL_USERNAME` | SMTP username | *(empty)* | Yes |
| `MAIL_PASSWORD` | SMTP password | *(empty)* | Yes |
| `MAIL_ENCRYPTION` | SMTP encryption | `tls` | `tls`, `ssl`, `null` |
| `MAIL_FROM_ADDRESS` | Sender email | *(empty)* | Yes |
| `MAIL_FROM_NAME` | Sender name | *(empty)* | Yes |

### Optional Environment Variables

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `TZ` | Container timezone | `UTC` | System timezone |
| `LOG_CHANNEL` | Logging driver | `daily` | `daily`, `single`, `syslog` |
| `BROADCAST_DRIVER` | Real-time broadcasting | `null` | `pusher`, `redis`, `null` |
| `FILESYSTEM_DRIVER` | File storage | `local` | `local`, `s3`, `gcs` |

## Volume Mounts and Persistence

### Application Data Volumes

| Container Path | Volume Name | Purpose | Backup Required |
|----------------|-------------|---------|-----------------|
| `/data` | `invoiceninja-application-application-data` | Application uploads, public assets | Yes |

### Database Data Volumes

| Container Path | Volume Name | Purpose | Backup Required |
|----------------|-------------|---------|-----------------|
| `/var/lib/mysql` | `invoiceninja-application-mariadb-data` | MariaDB database files | **Critical** |
| `/var/lib/postgresql/data` | `invoiceninja-application-postgres-data` | PostgreSQL database files (alternative) | **Critical** |

### Cache Data Volumes

| Container Path | Volume Name | Purpose | Backup Required |
|----------------|-------------|---------|-----------------|
| `/data` | `invoiceninja-application-redis-data` | Redis persistence | Recommended |

### Volume Characteristics

- **Persistence:** All named volumes persist data across container restarts
- **Performance:** Use SSD storage for database volumes in production
- **Backup Strategy:** Database volumes require daily backups with point-in-time recovery
- **Security:** Volumes should be encrypted at rest in production environments

## Service Configuration

### Application Service

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

### MariaDB Service

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

### Redis Service

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

### MariaDB Service (Alternative)

```yaml
Container: invoiceninja-application.mariadb (commented out by default)
Image: webgrip/invoiceninja-application.mariadb:latest
Ports: 3306:3306 (Internal)
Health Check: mariadb --execute="SELECT 1"
Character Set: utf8mb4
Collation: utf8mb4_unicode_ci
```

## Network Configuration

### Docker Compose Networking

- **Network Name:** `webgrip` (external)
- **Network Type:** Bridge network
- **DNS Resolution:** Automatic container name resolution
- **External Access:** Only application service exposed on localhost

### Port Mappings

| Service | Internal Port | External Port | Access |
|---------|---------------|---------------|--------|
| Application | 8080 | 8080 | localhost:8080 |
| MariaDB | 3306 | 3306 | localhost:3306 (development) |
| PostgreSQL | 5432 | 5432 | localhost:5432 (development) |
| Redis | 6379 | None | Internal only |

### Service Discovery

Services communicate using Docker Compose service names:
- `invoiceninja-application.application`
- `invoiceninja-application.mariadb`
- `invoiceninja-application.redis`
- `invoiceninja-application.postgres`

## Security Configuration

### Container Security

- **User Context:** Non-root user (where applicable)
- **Read-only Filesystem:** Applied to non-data directories
- **Capabilities:** Minimal required capabilities only
- **Security Scanning:** Regular vulnerability scanning enabled

### Network Security

- **Principle of Least Exposure:** Only application port exposed externally
- **Internal Communication:** Database and cache services not exposed
- **Firewall Rules:** Restrict access to management ports
- **TLS Encryption:** HTTPS required for production deployments

### Secret Management

- **Environment Files:** `.env` files excluded from version control
- **SOPS Encryption:** Sensitive configuration encrypted with age
- **Key Management:** Age keys stored in GitHub secrets
- **Rotation Policy:** Regular secret rotation recommended

### Compliance Considerations

- **Data Encryption:** Database encryption enabled for sensitive data
- **Audit Logging:** Application-level audit trails enabled
- **Access Controls:** Role-based access control within application
- **Backup Encryption:** Encrypted backups with separate key management

## Sources

Configuration details are derived from and consistent with official upstream documentation:

- **Invoice Ninja Environment Configuration**, https://invoiceninja.github.io/en/self-host-installation/#environment-variables, Retrieved 2025-01-09
- **Laravel Configuration Documentation**, https://laravel.com/docs/10.x/configuration, Retrieved 2025-01-09
- **Docker Compose File Reference**, https://docs.docker.com/compose/compose-file/, Retrieved 2025-01-09
- **PostgreSQL Docker Documentation**, https://hub.docker.com/_/postgres, Retrieved 2025-01-09
- **MariaDB Docker Documentation**, https://hub.docker.com/_/mariadb, Retrieved 2025-01-09
- **Redis Configuration Reference**, https://redis.io/topics/config, Retrieved 2025-01-09