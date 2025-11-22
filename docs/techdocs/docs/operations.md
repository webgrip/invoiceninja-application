---
title: "Operations"
description: "Day-to-day operational procedures for managing the Invoice Ninja application deployment"
tags:
  - operations
  - monitoring
  - maintenance
  - backup
  - performance
search:
  boost: 4
  exclude: false
icon: material/monitor-dashboard
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Operations

**Purpose Statement:** This document covers day-to-day operational procedures for managing the Invoice Ninja application deployment.

## Table of Contents

- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Log Management](#log-management)
- [Backup and Recovery](#backup-and-recovery)
- [Performance Optimization](#performance-optimization)
- [Security Operations](#security-operations)
- [Maintenance Procedures](#maintenance-procedures)

## Monitoring and Health Checks

### Application Health Monitoring

The Invoice Ninja application provides a built-in health check endpoint:

```bash
# Basic health check
curl -f http://localhost:8080/health

# Detailed health status
curl -s http://localhost:8080/health | jq '.'
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-09T14:30:00Z",
  "services": {
    "database": "healthy",
    "cache": "healthy",
    "queue": "healthy"
  }
}
```

### Service Health Monitoring

```bash
# Check all container status
docker-compose ps

# Check individual service health
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --execute="SELECT 1"
docker-compose exec invoiceninja-application.redis redis-cli ping

# Monitor resource usage
docker stats
```

### Automated Monitoring Setup

Create monitoring scripts for continuous health checks:

```bash
# Health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:8080/health"
ALERT_EMAIL="admin@yourcompany.com"

if ! curl -f -s "$HEALTH_URL" > /dev/null; then
    echo "Invoice Ninja health check failed at $(date)" | \
    mail -s "ALERT: Invoice Ninja Down" "$ALERT_EMAIL"
    exit 1
fi

echo "Health check passed at $(date)"
EOF

chmod +x health-check.sh

# Schedule health checks every 5 minutes
echo "*/5 * * * * /path/to/health-check.sh" | crontab -
```

### Performance Metrics

Monitor key performance indicators:

```bash
# Database performance
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="
SELECT 
    sql_text,
    count_star,
    avg_timer_wait/1000000000 as avg_seconds
FROM performance_schema.events_statements_summary_by_digest 
ORDER BY avg_timer_wait DESC 
LIMIT 10;
"
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;"

# Redis performance
docker-compose exec invoiceninja-application.redis redis-cli info stats

# Application response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

## Log Management

### Accessing Logs

```bash
# View all service logs
make logs

# Follow logs in real-time
make logs SERVICE=invoiceninja-application.application

# View logs from specific time
docker-compose logs --since="2025-01-09T10:00:00" invoiceninja-application.application

# Search logs for specific patterns
docker-compose logs invoiceninja-application.application | grep ERROR
```

### Log Rotation Configuration

Configure log rotation to prevent disk space issues:

```yaml
# Add to docker-compose.yml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    labels: "service=invoiceninja"
```

### Centralized Logging (Production)

For production environments, implement centralized logging:

```yaml
# Example with Fluentd
logging:
  driver: fluentd
  options:
    fluentd-address: "fluentd-server:24224"
    tag: "invoiceninja.{{.Name}}"
```

### Log Analysis

Common log patterns to monitor:

```bash
# Error patterns
docker-compose logs invoiceninja-application.application | grep -E "(ERROR|CRITICAL|FATAL)"

# Performance issues
docker-compose logs invoiceninja-application.application | grep -E "(slow|timeout|memory)"

# Security events
docker-compose logs invoiceninja-application.application | grep -E "(unauthorized|authentication|failed login)"

# Database connection issues
docker-compose logs invoiceninja-application.application | grep -E "(connection.*failed|database.*error)"
```

## Backup and Recovery

### Automated Backup Strategy

Implement automated backups with retention policies:

```bash
# Enhanced backup script
cat > enhanced-backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_BASE="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE/$TIMESTAMP"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# Database backup with compression
echo "Backing up database..."
docker-compose exec -T invoiceninja-application.mariadb mariadb-dump \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  invoiceninja | gzip > "$BACKUP_DIR/database.sql.gz"

# Application data backup
echo "Backing up application data..."
docker run --rm \
  -v invoiceninja-application-application-data:/data:ro \
  -v "$(pwd)/$BACKUP_DIR":/backup \
  busybox tar czf /backup/application-data.tar.gz -C /data .

# Configuration backup
echo "Backing up configuration..."
cp .env "$BACKUP_DIR/env.backup"
cp docker-compose.yml "$BACKUP_DIR/docker-compose.yml.backup"

# Backup verification
echo "Verifying backup integrity..."
gunzip -t "$BACKUP_DIR/database.sql.gz"
tar -tzf "$BACKUP_DIR/application-data.tar.gz" > /dev/null

# Create backup manifest
cat > "$BACKUP_DIR/manifest.txt" << MANIFEST
Backup created: $(date)
Database size: $(stat -c%s "$BACKUP_DIR/database.sql.gz") bytes
Application data size: $(stat -c%s "$BACKUP_DIR/application-data.tar.gz") bytes
Configuration files: env.backup, docker-compose.yml.backup
MANIFEST

# Cleanup old backups
echo "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_BASE" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;

echo "Backup completed successfully: $BACKUP_DIR"

# Optional: Upload to cloud storage
# aws s3 sync "$BACKUP_DIR" "s3://your-backup-bucket/invoiceninja/$TIMESTAMP/"

EOF

chmod +x enhanced-backup.sh

# Schedule daily backups at 2 AM
echo "0 2 * * * /path/to/invoiceninja-application/enhanced-backup.sh >> /var/log/invoiceninja-backup.log 2>&1" | crontab -
```

### Point-in-Time Recovery

For PostgreSQL, enable point-in-time recovery:

```bash
# Enable binary logging (add to MariaDB configuration)
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=root --password=root \
  --execute="
SET GLOBAL log_bin = ON;
SET GLOBAL binlog_format = 'ROW';
SET GLOBAL expire_logs_days = 7;
"

# Restart MariaDB to apply changes
docker-compose restart invoiceninja-application.mariadb
```

### Recovery Testing

Regularly test backup recovery procedures:

```bash
# Test recovery script
cat > test-recovery.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="$1"
if [ -z "$BACKUP_DIR" ]; then
    echo "Usage: $0 <backup_directory>"
    exit 1
fi

echo "Testing recovery from $BACKUP_DIR"

# Create test environment
docker network create test-network || true
docker volume create test-db-data || true
docker volume create test-app-data || true

# Start test database
docker run -d --name test-mariadb \
  --network test-network \
  -e MARIADB_DATABASE=invoiceninja \
  -e MARIADB_USER=invoiceninja \
  -e MARIADB_PASSWORD=test_password \
  -e MARIADB_ROOT_PASSWORD=root \
  -v test-db-data:/var/lib/mysql \
  mariadb:12.0.2-noble

# Wait for database
sleep 15

# Restore database
gunzip -c "$BACKUP_DIR/database.sql.gz" | \
  docker exec -i test-mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=test_password invoiceninja

# Restore application data
docker run --rm \
  -v test-app-data:/data \
  -v "$BACKUP_DIR":/backup \
  busybox tar xzf /backup/application-data.tar.gz -C /data

echo "Recovery test completed successfully"

# Cleanup
docker stop test-mariadb && docker rm test-mariadb
docker volume rm test-db-data test-app-data
docker network rm test-network
EOF

chmod +x test-recovery.sh

# Test monthly
echo "0 3 1 * * /path/to/invoiceninja-application/test-recovery.sh /path/to/recent/backup >> /var/log/recovery-test.log 2>&1" | crontab -
```

## Performance Optimization

### Database Optimization

```bash
# Analyze database performance
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="
SELECT 
    table_schema, 
    table_name, 
    cardinality,
    table_rows
FROM information_schema.statistics 
WHERE table_schema = 'invoiceninja'
GROUP BY table_schema, table_name
ORDER BY cardinality DESC;
"

# Update database statistics
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="ANALYZE TABLE invoices, clients, products;"

# Check for missing indexes
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="
SELECT 
    table_name,
    non_unique,
    index_name,
    column_name
FROM information_schema.statistics 
WHERE table_schema = 'invoiceninja'
ORDER BY table_name, index_name;
"
```

### Application Performance Tuning

```bash
# Clear application cache
make run CMD="php artisan cache:clear"
make run CMD="php artisan config:clear"
make run CMD="php artisan route:clear"
make run CMD="php artisan view:clear"

# Optimize for production
make run CMD="php artisan config:cache"
make run CMD="php artisan route:cache"
make run CMD="php artisan view:cache"

# Queue optimization
make run CMD="php artisan queue:restart"
```

### Redis Optimization

```bash
# Monitor Redis performance
docker-compose exec invoiceninja-application.redis redis-cli info memory
docker-compose exec invoiceninja-application.redis redis-cli info stats

# Optimize Redis memory usage
docker-compose exec invoiceninja-application.redis redis-cli config set maxmemory-policy allkeys-lru
docker-compose exec invoiceninja-application.redis redis-cli config set save "900 1 300 10 60 10000"
```

## Security Operations

### Security Monitoring

```bash
# Monitor failed authentication attempts
docker-compose logs invoiceninja-application.application | grep -i "authentication failed"

# Check for suspicious activities
docker-compose logs invoiceninja-application.application | grep -E "(injection|xss|csrf)"

# Monitor file integrity
find /var/lib/docker/volumes/invoiceninja-application-application-data/_data -type f -newer /tmp/last-check 2>/dev/null
```

### Security Updates

```bash
# Check for security updates
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  clair-scanner:latest \
  webgrip/invoiceninja-application.application:latest

# Update base images
docker-compose pull
docker-compose up -d
```

### Access Control Auditing

```bash
# Audit container permissions
docker-compose exec invoiceninja-application.application whoami
docker-compose exec invoiceninja-application.application id

# Check file permissions
docker-compose exec invoiceninja-application.application find /data -type f -perm /o+w

# Audit network access
docker network inspect webgrip
```

## Maintenance Procedures

### Regular Maintenance Tasks

Weekly maintenance script:

```bash
cat > weekly-maintenance.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting weekly maintenance at $(date)"

# Clear application cache
echo "Clearing application cache..."
docker-compose exec -T invoiceninja-application.application php artisan cache:clear

# Optimize database
echo "Optimizing database..."
docker-compose exec -T invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="OPTIMIZE TABLE invoices, clients, products;"

# Clean up old files
echo "Cleaning up temporary files..."
docker-compose exec -T invoiceninja-application.application find /tmp -type f -mtime +7 -delete

# Restart queue workers
echo "Restarting queue workers..."
docker-compose exec -T invoiceninja-application.application php artisan queue:restart

# Check disk usage
echo "Checking disk usage..."
df -h

# Generate maintenance report
echo "Maintenance completed at $(date)"
echo "Container status:"
docker-compose ps

echo "Resource usage:"
docker stats --no-stream

echo "Weekly maintenance completed successfully"
EOF

chmod +x weekly-maintenance.sh

# Schedule weekly maintenance on Sundays at 3 AM
echo "0 3 * * 0 /path/to/invoiceninja-application/weekly-maintenance.sh >> /var/log/maintenance.log 2>&1" | crontab -
```

### Emergency Procedures

Quick recovery procedures for common issues:

```bash
# Emergency restart
cat > emergency-restart.sh << 'EOF'
#!/bin/bash
echo "Emergency restart initiated at $(date)"

# Stop services gracefully
docker-compose stop

# Wait for proper shutdown
sleep 10

# Start services
docker-compose up -d

# Wait for services to be ready
sleep 30

# Verify health
curl -f http://localhost:8080/health || echo "Health check failed!"

echo "Emergency restart completed at $(date)"
EOF

# Quick database recovery
cat > emergency-db-fix.sh << 'EOF'
#!/bin/bash
echo "Emergency database fix initiated at $(date)"

# Restart database
docker-compose restart invoiceninja-application.mariadb

# Wait for database
sleep 15

# Check database integrity
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="SELECT 1;"

# Run database maintenance
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="CHECK TABLE invoices, clients, products; REPAIR TABLE invoices, clients, products;"

echo "Emergency database fix completed at $(date)"
EOF

chmod +x emergency-restart.sh emergency-db-fix.sh
```

## Sources

Operational procedures are based on Docker best practices and Invoice Ninja maintenance guidelines:

- **Docker Production Operations**, https://docs.docker.com/config/containers/logging/, Retrieved 2025-01-16
- **PostgreSQL Maintenance Documentation**, https://www.postgresql.org/docs/current/maintenance.html, Retrieved 2025-01-16
- **MariaDB Administration Guide**, https://mariadb.com/kb/en/, Retrieved 2025-01-16
- **Laravel Optimization Guide**, https://laravel.com/docs/10.x/deployment#optimization, Retrieved 2025-01-16
- **Redis Administration Guide**, https://redis.io/docs/latest/operate/oss_and_stack/management/, Retrieved 2025-01-16