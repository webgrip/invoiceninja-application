# Deployment

**Purpose Statement:** This document describes how to deploy and manage the Invoice Ninja application using the provided Makefile and Docker Compose configuration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Deployment Procedures](#deployment-procedures)
- [Upgrade Procedures](#upgrade-procedures)
- [Rollback Procedures](#rollback-procedures)
- [Production Considerations](#production-considerations)

## Prerequisites

### System Requirements

- **Docker Engine:** 20.10+ with Docker Compose V2
- **Operating System:** Linux (Ubuntu 20.04+, RHEL 8+, or equivalent)
- **Memory:** 4GB RAM minimum (8GB recommended for production)
- **Storage:** 20GB available space (SSD recommended)
- **Network:** Outbound internet access for image pulls and updates

### Required Tools

Install the following tools on the deployment host:

```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Make (usually pre-installed)
sudo apt-get update && sudo apt-get install -y make

# Age for secret encryption (optional)
sudo apt-get install -y age

# SOPS for secret management (optional)
curl -LO https://github.com/mozilla/sops/releases/download/v3.8.1/sops-v3.8.1.linux.amd64
sudo mv sops-v3.8.1.linux.amd64 /usr/local/bin/sops
sudo chmod +x /usr/local/bin/sops
```

### Network Setup

Ensure the following ports are available:

- **8080/tcp** - Application web interface
- **5432/tcp** - PostgreSQL (development only)
- **3306/tcp** - MariaDB (development only, if used)

## Initial Setup

### 1. Repository Clone and Configuration

```bash
# Clone the repository
git clone https://github.com/webgrip/invoiceninja-application.git
cd invoiceninja-application

# Copy and configure environment
cp .env.example .env
```

### 2. Environment Configuration

Edit `.env` file with your specific settings:

```bash
# Required: Set strong database credentials
DB_DATABASE=invoiceninja
DB_USERNAME=invoiceninja_user
DB_PASSWORD=<generate-strong-password>
DB_ROOT_PASSWORD=<generate-strong-root-password>

# Required: Set your domain
SUBDOMAIN=invoiceninja
DOMAIN_NAME=yourcompany.com
BASE_URL=https://invoiceninja.yourcompany.com

# Required: Application key (will be generated)
APP_KEY=

# Recommended: Mail configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-server.com
MAIL_PORT=587
MAIL_USERNAME=your-email@yourcompany.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourcompany.com
MAIL_FROM_NAME="Your Company Invoices"
```

### 3. Secret Management (Production)

For production deployments, use encrypted secrets:

```bash
# Initialize age encryption
make secrets:init

# Add your secrets to the decrypted file
nano ops/secrets/invoiceninja-application-secrets/values.dec.yaml

# Encrypt the secrets
make secrets:encrypt SECRETS_DIR=./ops/secrets/invoiceninja-application-secrets

# Add the age key to your deployment environment
export SOPS_AGE_KEY=$(cat .age.key)
```

### 4. Network Setup

Create the required Docker network:

```bash
# Create external network
docker network create webgrip
```

## Deployment Procedures

### Quick Start Deployment

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

### Production Deployment

1. **Pre-deployment Verification**

```bash
# Verify configuration
docker-compose config

# Check image availability
docker-compose pull --ignore-pull-failures

# Verify external network exists
docker network inspect webgrip
```

2. **Database Initialization**

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

3. **Application Deployment**

```bash
# Start all services
make start

# Monitor startup
make logs SERVICE=invoiceninja-application.application

# Wait for application readiness
make wait-ready URL=http://localhost:8080/health
```

4. **Initial Configuration**

```bash
# Create admin user (customize command for Invoice Ninja)
make user:create EMAIL=admin@yourcompany.com PASS=initial-password

# Access the application and complete setup wizard
# Navigate to http://localhost:8080/setup
```

### Service Management

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

## Upgrade Procedures

### Pre-upgrade Checklist

- [ ] Database backup completed
- [ ] Application volume backup completed
- [ ] Maintenance window scheduled
- [ ] Rollback plan tested
- [ ] New image tags verified

### Backup Procedure

```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d_%H%M%S)

# Backup database
docker-compose exec invoiceninja-application.mariadb mariadb-dump \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  invoiceninja > backups/$(date +%Y%m%d_%H%M%S)/database.sql

# Backup application data volume
docker run --rm -v invoiceninja-application-application-data:/data \
  -v $(pwd)/backups/$(date +%Y%m%d_%H%M%S):/backup \
  busybox tar czf /backup/application-data.tar.gz -C /data .

# Backup configuration
cp .env backups/$(date +%Y%m%d_%H%M%S)/env.backup
```

### Upgrade Process

1. **Update Image Tags**

```bash
# Edit docker-compose.yml to update image tags
sed -i 's/:latest/:v5.8.0/g' docker-compose.yml

# Or for specific service
sed -i 's/webgrip\/invoiceninja-application\.application:latest/webgrip\/invoiceninja-application\.application:v5.8.0/' docker-compose.yml
```

2. **Pull New Images**

```bash
# Pull updated images
docker-compose pull

# Verify image updates
docker images | grep webgrip/invoiceninja-application
```

3. **Deploy Update**

```bash
# Stop current services
make stop

# Start with new images
make start

# Monitor deployment
make logs

# Wait for readiness
make wait-ready URL=http://localhost:8080/health
```

4. **Post-upgrade Verification**

```bash
# Verify application functionality
curl -f http://localhost:8080/health

# Check database migrations
make run CMD="php artisan migrate:status"

# Verify user authentication
# Login to web interface and perform key functions
```

## Rollback Procedures

### Automatic Rollback

If health checks fail during upgrade:

```bash
# Stop failed deployment
make stop

# Restore previous image tags
git checkout HEAD~1 -- docker-compose.yml

# Restart with previous images
make start

# Verify rollback success
make wait-ready URL=http://localhost:8080/health
```

### Manual Rollback with Data Restore

If data corruption occurs:

1. **Stop All Services**

```bash
make stop
```

2. **Restore Database**

```bash
# Remove corrupted data
docker volume rm invoiceninja-application-mariadb-data

# Recreate volume
docker volume create invoiceninja-application-mariadb-data

# Start database service
docker-compose up -d invoiceninja-application.mariadb

# Wait for database ready
sleep 30

# Restore from backup
cat backups/20250109_140000/database.sql | \
  docker-compose exec -T invoiceninja-application.mariadb \
  mariadb --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja invoiceninja
```

3. **Restore Application Data**

```bash
# Remove corrupted application data
docker volume rm invoiceninja-application-application-data

# Recreate volume
docker volume create invoiceninja-application-application-data

# Restore from backup
docker run --rm -v invoiceninja-application-application-data:/data \
  -v $(pwd)/backups/20250109_140000:/backup \
  busybox tar xzf /backup/application-data.tar.gz -C /data
```

4. **Restart Services**

```bash
# Start all services
make start

# Verify restoration
make wait-ready URL=http://localhost:8080/health
```

## Production Considerations

### Resource Allocation

Adjust resource limits in docker-compose.yml for production:

```yaml
services:
  invoiceninja-application.application:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### Security Hardening

1. **Network Security**

```bash
# Create dedicated network for production
docker network create --driver bridge \
  --subnet=172.20.0.0/16 \
  --ip-range=172.20.240.0/20 \
  invoiceninja-prod

# Update docker-compose.yml to use dedicated network
```

2. **Container Security**

```yaml
# Add security options to containers
security_opt:
  - no-new-privileges:true
  - seccomp:unconfined
read_only: true  # Where applicable
user: "1001:1001"  # Non-root user
```

3. **Secret Management**

```bash
# Use Docker secrets in production
echo "database_password" | docker secret create db_password -
```

### Monitoring and Alerting

1. **Health Monitoring**

```bash
# Set up health check monitoring
*/5 * * * * curl -f http://localhost:8080/health || echo "Invoice Ninja health check failed" | mail -s "Alert" admin@yourcompany.com
```

2. **Log Management**

```yaml
# Configure centralized logging
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    labels: "service=invoiceninja"
```

### Backup Strategy

1. **Automated Backups**

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Database backup
docker-compose exec invoiceninja-application.mariadb mariadb-dump \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  invoiceninja > "$BACKUP_DIR/database.sql"

# Application data backup
docker run --rm -v invoiceninja-application-application-data:/data \
  -v $(pwd)/$BACKUP_DIR:/backup busybox \
  tar czf /backup/application-data.tar.gz -C /data .

# Clean old backups (keep 30 days)
find backups/ -type d -mtime +30 -exec rm -rf {} \;
EOF

chmod +x backup.sh

# Schedule via cron
echo "0 2 * * * /path/to/invoiceninja-application/backup.sh" | crontab -
```

2. **Offsite Backup**

```bash
# Upload to cloud storage (example with AWS S3)
aws s3 sync backups/ s3://your-backup-bucket/invoiceninja-backups/
```

## Sources

Deployment procedures are based on Docker Compose best practices and Invoice Ninja installation guidelines:

- **Docker Compose Production Guide**, https://docs.docker.com/compose/production/, Retrieved 2025-01-09
- **Invoice Ninja Installation Documentation**, https://invoiceninja.github.io/en/self-host-installation/, Retrieved 2025-01-09
- **Laravel Deployment Best Practices**, https://laravel.com/docs/10.x/deployment, Retrieved 2025-01-09