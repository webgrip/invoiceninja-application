---
title: "Troubleshooting"
description: "Common issues and solutions for the Invoice Ninja application stack"
tags:
  - troubleshooting
  - issues
  - solutions
  - debugging
  - error-handling
search:
  boost: 4
  exclude: false
icon: material/tools
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Troubleshooting

**Purpose Statement:** This document covers the most frequent operational issues in the Invoice Ninja application stack and their solutions.

## Table of Contents

- [Application Issues](#application-issues)
- [Database Issues](#database-issues)
- [Network and Connectivity Issues](#network-and-connectivity-issues)
- [Performance Issues](#performance-issues)
- [Container and Docker Issues](#container-and-docker-issues)
- [Configuration Issues](#configuration-issues)

## Application Issues

### Application Won't Start

**Symptoms:**
- Container exits immediately
- Health check fails
- Application logs show startup errors

**Diagnostic Steps:**

```bash
# Check container status
docker-compose ps

# View application logs
make logs SERVICE=invoiceninja-application.application

# Check configuration
docker-compose config

# Verify environment variables
docker-compose exec invoiceninja-application.application env | grep APP_
```

**Common Causes and Solutions:**

1. **Missing APP_KEY**

```bash
# Generate application key
make run CMD="php artisan key:generate"

# Verify key is set
grep APP_KEY .env
```

2. **Database Connection Failed**

```bash
# Verify database is running
docker-compose ps invoiceninja-application.mariadb

# Test database connectivity
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --execute="SELECT 1;"

# Check database credentials in .env
grep DB_ .env
```

3. **Permission Issues**

```bash
# Fix file permissions
docker-compose exec invoiceninja-application.application chown -R www-data:www-data /var/www/html/storage
docker-compose exec invoiceninja-application.application chmod -R 755 /var/www/html/storage
```

### Application Responds Slowly

**Symptoms:**
- Page load times > 5 seconds
- Timeout errors
- High CPU usage

**Diagnostic Steps:**

```bash
# Check resource usage
docker stats

# Monitor application performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/

# Check queue status
make run CMD="php artisan queue:work --once"

# Review slow queries
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
```

**Solutions:**

1. **Clear Application Cache**

```bash
make run CMD="php artisan cache:clear"
make run CMD="php artisan config:clear"
make run CMD="php artisan route:clear"
make run CMD="php artisan view:clear"
```

2. **Optimize for Production**

```bash
make run CMD="php artisan config:cache"
make run CMD="php artisan route:cache"
make run CMD="php artisan view:cache"
```

3. **Increase Resource Limits**

Edit `docker-compose.yml`:

```yaml
services:
  invoiceninja-application.application:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
```

### Error 500 - Internal Server Error

**Symptoms:**
- Application returns HTTP 500
- White page with no content
- Generic error message

**Diagnostic Steps:**

```bash
# Enable debug mode temporarily
sed -i 's/APP_DEBUG=false/APP_DEBUG=true/' .env
docker-compose restart invoiceninja-application.application

# Check Laravel logs
make run CMD="tail -f storage/logs/laravel.log"

# Check PHP error log
docker-compose logs invoiceninja-application.application | grep -i error
```

**Common Solutions:**

1. **Fix Storage Permissions**

```bash
make run CMD="chmod -R 755 storage"
make run CMD="chmod -R 755 bootstrap/cache"
```

2. **Check Database Schema**

```bash
make run CMD="php artisan migrate:status"
make run CMD="php artisan migrate"
```

3. **Clear and Regenerate Caches**

```bash
make run CMD="php artisan cache:clear"
make run CMD="php artisan config:cache"
```

**Important:** Disable debug mode after troubleshooting:

```bash
sed -i 's/APP_DEBUG=true/APP_DEBUG=false/' .env
docker-compose restart invoiceninja-application.application
```

## Database Issues

### Database Connection Refused

**Symptoms:**
- "Connection refused" errors
- Database container not running
- Application can't connect to database

**Diagnostic Steps:**

```bash
# Check database container status
docker-compose ps invoiceninja-application.mariadb

# Check database logs
make logs SERVICE=invoiceninja-application.mariadb

# Test connection from application container
docker-compose exec invoiceninja-application.application nc -zv invoiceninja-application.mariadb 3306
```

**Solutions:**

1. **Restart Database Service**

```bash
docker-compose restart invoiceninja-application.mariadb

# Wait for database to be ready
sleep 15
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --execute="SELECT 1;"
```

2. **Check Network Connectivity**

```bash
# Verify network exists
docker network inspect webgrip

# Recreate network if needed
docker network create webgrip
```

3. **Verify Database Credentials**

```bash
# Check environment variables
grep DB_ .env

# Test manual connection
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="SELECT VERSION();"
```

### Database Performance Issues

**Symptoms:**
- Slow query responses
- High database CPU usage
- Connection timeouts

**Diagnostic Steps:**

```bash
# Check database performance
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="
SELECT 
    table_schema,
    table_name,
    table_rows,
    data_length,
    index_length
FROM information_schema.tables 
WHERE table_schema = 'invoiceninja'
ORDER BY data_length DESC;
"

# Monitor active connections
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="SHOW PROCESSLIST;"
"
```

**Solutions:**

1. **Optimize Database**

```bash
# Analyze tables
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="ANALYZE TABLE invoices, clients, products;"

# Optimize database
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="OPTIMIZE TABLE invoices, clients, products;"
```

2. **Add Missing Indexes**

```bash
# Identify missing indexes
make run CMD="php artisan db:show --counts"

# Run migrations to add indexes
make run CMD="php artisan migrate"
```

3. **Increase Database Resources**

Edit `docker-compose.yml`:

```yaml
services:
  invoiceninja-application.mariadb:
    environment:
      - MARIADB_INNODB_BUFFER_POOL_SIZE=256M
      - MARIADB_INNODB_LOG_FILE_SIZE=64M
    deploy:
      resources:
        limits:
          memory: 2G
```

### Database Corruption

**Symptoms:**
- Database container won't start
- Data integrity errors
- Corrupted data files

**Diagnostic Steps:**

```bash
# Check database logs for corruption
make logs SERVICE=invoiceninja-application.mariadb | grep -i corrupt

# Check filesystem
docker run --rm -v invoiceninja-application-mariadb-data:/data busybox ls -la /data

# Verify database integrity
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja \
  --database=invoiceninja \
  --execute="CHECK TABLE invoices, clients, products;"
```

**Recovery Steps:**

1. **Stop Services**

```bash
make stop
```

2. **Attempt Database Repair**

```bash
# Start database in recovery mode
docker run --rm -it \
  -v invoiceninja-application-mariadb-data:/var/lib/mysql \
  mariadb:12.0.2-noble mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=root --password=root \
  invoiceninja

# Check for corruption and repair
# In MariaDB shell:
# CHECK TABLE invoices, clients, products;
# REPAIR TABLE invoices, clients, products;
```

3. **Restore from Backup**

```bash
# Remove corrupted data
docker volume rm invoiceninja-application-mariadb-data

# Create new volume
docker volume create invoiceninja-application-mariadb-data

# Start database
docker-compose up -d invoiceninja-application.mariadb
sleep 15

# Restore from backup
gunzip -c backups/latest/database.sql.gz | \
  docker-compose exec -T invoiceninja-application.mariadb \
  mariadb --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja invoiceninja
```

## Network and Connectivity Issues

### Cannot Access Application

**Symptoms:**
- Browser shows "connection refused"
- Curl commands fail
- Application not reachable

**Diagnostic Steps:**

```bash
# Check if application is listening
curl -f http://localhost:8080/health

# Verify port binding
docker-compose ps
netstat -tlnp | grep 8080

# Check firewall rules
sudo ufw status
sudo iptables -L
```

**Solutions:**

1. **Verify Port Configuration**

Check `docker-compose.yml`:

```yaml
services:
  invoiceninja-application.application:
    ports:
      - "127.0.0.1:8080:8080"  # Correct binding
      # Not: - "8080:8080"     # This exposes on all interfaces
```

2. **Check Application Configuration**

```bash
# Verify APP_URL matches access URL
grep APP_URL .env

# Check for proxy configuration
grep -i proxy .env
```

3. **Network Troubleshooting**

```bash
# Test from host
curl -v http://localhost:8080/

# Test from within container network
docker run --rm --network webgrip busybox wget -qO- http://invoiceninja-application.application:8080/health
```

### SSL/TLS Issues

**Symptoms:**
- Certificate errors
- Mixed content warnings
- HTTPS not working

**Solutions:**

1. **Configure Reverse Proxy**

```nginx
# Nginx configuration
server {
    listen 443 ssl;
    server_name invoiceninja.yourcompany.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **Update Application Configuration**

```bash
# Update .env for HTTPS
sed -i 's|APP_URL=http://|APP_URL=https://|' .env
docker-compose restart invoiceninja-application.application
```

## Performance Issues

### High Memory Usage

**Symptoms:**
- Container memory usage > 90%
- Out of memory errors
- Application crashes

**Diagnostic Steps:**

```bash
# Monitor memory usage
docker stats --no-stream

# Check PHP memory configuration
make run CMD="php -i | grep memory_limit"

# Monitor application memory usage
make run CMD="php artisan tinker" 
# In tinker: echo memory_get_usage(true);
```

**Solutions:**

1. **Increase Memory Limits**

Edit `docker-compose.yml`:

```yaml
services:
  invoiceninja-application.application:
    deploy:
      resources:
        limits:
          memory: 2G
```

2. **Optimize PHP Configuration**

Create custom PHP configuration:

```ini
# ops/docker/application/php.ini
memory_limit = 512M
max_execution_time = 300
upload_max_filesize = 100M
post_max_size = 100M
```

3. **Clear Memory Leaks**

```bash
# Restart application
docker-compose restart invoiceninja-application.application

# Clear all caches
make run CMD="php artisan cache:clear"
make run CMD="php artisan queue:restart"
```

### High CPU Usage

**Symptoms:**
- CPU usage consistently > 80%
- Slow response times
- Queue processing delays

**Diagnostic Steps:**

```bash
# Monitor CPU usage
docker stats

# Check for runaway processes
docker-compose exec invoiceninja-application.application top

# Monitor queue workers
make run CMD="php artisan queue:work --once"
```

**Solutions:**

1. **Optimize Queue Processing**

```bash
# Process queues in background
make run CMD="php artisan queue:work --daemon" &

# Clear failed jobs
make run CMD="php artisan queue:flush"
```

2. **Scale Resources**

```yaml
# docker-compose.yml
services:
  invoiceninja-application.application:
    deploy:
      resources:
        limits:
          cpus: '2.0'
        reservations:
          cpus: '1.0'
```

## Container and Docker Issues

### Container Exits Immediately

**Symptoms:**
- Container status shows "Exited (1)"
- Service doesn't stay running
- Restart loop

**Diagnostic Steps:**

```bash
# Check exit status
docker-compose ps

# View container logs
docker-compose logs invoiceninja-application.application

# Run container interactively
docker-compose run --rm invoiceninja-application.application /bin/bash
```

**Solutions:**

1. **Fix Entrypoint Script**

```bash
# Check if entrypoint script is executable
docker-compose run --rm invoiceninja-application.application ls -la /entrypoint.sh

# Make executable if needed
docker-compose exec invoiceninja-application.application chmod +x /entrypoint.sh
```

2. **Verify Dependencies**

```bash
# Check if required files exist
docker-compose run --rm invoiceninja-application.application ls -la /var/www/html

# Verify PHP configuration
docker-compose run --rm invoiceninja-application.application php --version
```

### Image Build Failures

**Symptoms:**
- Docker build fails
- Missing dependencies
- Build context issues

**Solutions:**

1. **Clear Build Cache**

```bash
# Remove build cache
docker system prune -f
docker-compose build --no-cache
```

2. **Check Dockerfile**

```bash
# Validate Dockerfile syntax
docker run --rm -i hadolint/hadolint < ops/docker/application/Dockerfile
```

3. **Verify Build Context**

```bash
# Check .dockerignore
cat .dockerignore

# Verify required files are present
ls -la ops/docker/application/
```

## Configuration Issues

### Environment Variables Not Applied

**Symptoms:**
- Configuration changes don't take effect
- Application uses default values
- Settings not persisted

**Solutions:**

1. **Restart After Configuration Changes**

```bash
# Always restart after .env changes
docker-compose restart invoiceninja-application.application

# Verify environment variables
docker-compose exec invoiceninja-application.application env | grep APP_
```

2. **Clear Configuration Cache**

```bash
make run CMD="php artisan config:clear"
make run CMD="php artisan config:cache"
```

3. **Validate Configuration Format**

```bash
# Check .env syntax
cat .env | grep -v '^#' | grep -v '^$'

# Validate docker-compose.yml
docker-compose config
```

### Email Configuration Issues

**Symptoms:**
- Emails not being sent
- SMTP authentication failures
- Mail queue backing up

**Diagnostic Steps:**

```bash
# Test mail configuration
make run CMD="php artisan tinker"
# In tinker: Mail::raw('Test email', function($msg) { $msg->to('test@example.com')->subject('Test'); });

# Check mail queue
make run CMD="php artisan queue:work --once"

# View mail logs
docker-compose logs invoiceninja-application.application | grep -i mail
```

**Solutions:**

1. **Verify SMTP Settings**

```bash
# Check mail configuration
grep MAIL_ .env

# Test SMTP connection
telnet your-smtp-server.com 587
```

2. **Configure Mail Queue**

```bash
# Process mail queue
make run CMD="php artisan queue:work --queue=mail --once"

# Clear failed mail jobs
make run CMD="php artisan queue:flush"
```

## Emergency Recovery Procedures

### Complete System Recovery

When all else fails:

```bash
# 1. Stop all services
make stop

# 2. Backup current state
mkdir -p emergency-backup
docker run --rm -v invoiceninja-application-mariadb-data:/data -v $(pwd)/emergency-backup:/backup busybox cp -a /data/. /backup/

# 3. Reset to known good state
git checkout HEAD~1 -- docker-compose.yml .env

# 4. Pull fresh images
docker-compose pull

# 5. Start services
make start

# 6. Verify health
make wait-ready URL=http://localhost:8080/health
```

### Data Recovery

```bash
# Restore from latest backup
LATEST_BACKUP=$(ls -1 backups/ | tail -1)
echo "Restoring from: $LATEST_BACKUP"

# Stop services
make stop

# Restore database
docker volume rm invoiceninja-application-mariadb-data
docker volume create invoiceninja-application-mariadb-data
docker-compose up -d invoiceninja-application.mariadb
sleep 15

gunzip -c "backups/$LATEST_BACKUP/database.sql.gz" | \
  docker-compose exec -T invoiceninja-application.mariadb \
  mariadb --socket=/var/run/mysqld/mysqld.sock \
  --user=invoiceninja --password=invoiceninja invoiceninja

# Restore application data
docker volume rm invoiceninja-application-application-data
docker volume create invoiceninja-application-application-data
docker run --rm -v invoiceninja-application-application-data:/data \
  -v $(pwd)/backups/$LATEST_BACKUP:/backup \
  busybox tar xzf /backup/application-data.tar.gz -C /data

# Start all services
make start
```

## Sources

Troubleshooting procedures are based on common issues and solutions from Invoice Ninja community and Docker best practices:

- **Invoice Ninja Community Support**, https://invoiceninja.github.io/, Retrieved 2025-01-16
- **Laravel Debugging Documentation**, https://laravel.com/docs/10.x/errors, Retrieved 2025-01-16
- **Docker Troubleshooting Guide**, https://docs.docker.com/config/containers/troubleshoot/, Retrieved 2025-01-16
- **PostgreSQL Common Problems**, https://www.postgresql.org/docs/current/appendixes.html, Retrieved 2025-01-16
- **MariaDB Knowledge Base**, https://mariadb.com/kb/en/, Retrieved 2025-01-16