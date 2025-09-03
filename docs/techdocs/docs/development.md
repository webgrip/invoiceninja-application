# Development

**Purpose Statement:** This document describes the development workflow and customization procedures for the Invoice Ninja application deployment.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Local Development Workflow](#local-development-workflow)
- [Customization Guidelines](#customization-guidelines)
- [Testing Procedures](#testing-procedures)
- [Build and Release Process](#build-and-release-process)
- [Contributing Guidelines](#contributing-guidelines)

## Development Environment Setup

### Prerequisites

Ensure you have the following tools installed:

- **Docker Desktop** 4.0+ or **Docker Engine** 20.10+ with Docker Compose V2
- **Git** 2.30+
- **Make** (usually pre-installed on Linux/macOS)
- **Text Editor/IDE** (VS Code recommended with Docker extension)

### Initial Setup

1. **Clone and Setup Repository**

```bash
# Clone the repository
git clone https://github.com/webgrip/invoiceninja-application.git
cd invoiceninja-application

# Create development environment file
cp .env.example .env.development

# Edit development configuration
nano .env.development
```

2. **Development Environment Configuration**

Update `.env.development` with development-specific settings:

```bash
# Development overrides
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8080

# Database configuration
DB_DATABASE=invoiceninja_dev
DB_USERNAME=dev_user
DB_PASSWORD=dev_password

# Use development-friendly settings
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

# Mail configuration for testing
MAIL_MAILER=log
LOG_CHANNEL=daily
```

3. **Start Development Environment**

```bash
# Use development environment file
export ENV_FILE=.env.development

# Start development stack
make start

# Follow logs
make logs
```

### IDE Configuration

For VS Code, create `.vscode/settings.json`:

```json
{
  "docker.defaultRegistryPath": "webgrip",
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/vendor/**": true,
    "**/storage/**": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/vendor": true
  }
}
```

## Local Development Workflow

### Daily Development Cycle

1. **Start Development Session**

```bash
# Pull latest changes
git pull origin main

# Start development environment
make start

# Verify services are healthy
curl -f http://localhost:8080/health
```

2. **Making Changes**

```bash
# Enter application container for development
make enter

# Or run specific commands
make run CMD="php artisan migrate"
make run CMD="composer install"
make run CMD="npm install"
```

3. **Live Reload and Hot Reloading**

For frontend development with live reload:

```bash
# If using Laravel Mix or Vite
make run CMD="npm run dev"

# For hot module replacement
make run CMD="npm run hot"
```

4. **End Development Session**

```bash
# Stop services
make stop

# Commit changes
git add .
git commit -m "feat: description of changes"
git push origin feature-branch
```

### Development Database Management

```bash
# Reset development database
make run CMD="php artisan migrate:fresh --seed"

# Run specific migration
make run CMD="php artisan migrate --path=/database/migrations/2024_01_01_000000_create_custom_table.php"

# Generate new migration
make run CMD="php artisan make:migration create_custom_feature_table"

# Rollback migrations
make run CMD="php artisan migrate:rollback"

# Check migration status
make run CMD="php artisan migrate:status"
```

### Development Debugging

1. **Enable Xdebug**

Create `ops/docker/application/Dockerfile.dev`:

```dockerfile
FROM webgrip/invoiceninja-application.application:latest

# Install Xdebug
RUN apk add --no-cache $PHPIZE_DEPS \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug

# Xdebug configuration
COPY xdebug.ini /usr/local/etc/php/conf.d/xdebug.ini

EXPOSE 9003
```

Create `ops/docker/application/xdebug.ini`:

```ini
[xdebug]
xdebug.mode=debug
xdebug.client_host=host.docker.internal
xdebug.client_port=9003
xdebug.start_with_request=yes
```

2. **Log Debugging**

```bash
# Follow application logs
make logs SERVICE=invoiceninja-application.application

# View Laravel logs
make run CMD="tail -f storage/logs/laravel.log"

# View specific log level
docker-compose logs invoiceninja-application.application | grep ERROR
```

3. **Database Debugging**

```bash
# Monitor database queries
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

# Enable general query logging
docker-compose exec invoiceninja-application.mariadb mariadb \
  --socket=/var/run/mysqld/mysqld.sock \
  --user=root --password=root \
  --execute="
SET GLOBAL general_log = 'ON';
SET GLOBAL general_log_file = '/var/log/mysql/queries.log';
"
```

## Customization Guidelines

### Application Customization

Invoice Ninja supports extensive customization through:

1. **Custom Templates**

```bash
# Generate custom template
make run CMD="php artisan make:view invoices.custom-template"

# Location: resources/views/invoices/custom-template.blade.php
```

2. **Custom Modules**

```bash
# Create custom module
make run CMD="php artisan make:module CustomFeature"

# Structure:
# app/Modules/CustomFeature/
# ├── Controllers/
# ├── Models/
# ├── Views/
# └── Routes/
```

3. **Custom Middleware**

```bash
# Create middleware
make run CMD="php artisan make:middleware CustomAuthMiddleware"

# Register in app/Http/Kernel.php
```

### Container Image Customization

1. **Extend Base Application Image**

Create `ops/docker/application/Dockerfile.custom`:

```dockerfile
FROM webgrip/invoiceninja-application.application:latest

# Add custom dependencies
RUN apk add --no-cache \
    imagemagick \
    imagemagick-dev

# Install PHP extensions
RUN docker-php-ext-install \
    imagick

# Copy custom configuration
COPY custom-config/ /var/www/html/config/

# Copy custom themes
COPY custom-themes/ /var/www/html/public/themes/

# Set ownership
RUN chown -R www-data:www-data /var/www/html/public/themes/
```

2. **Build Custom Image**

```bash
# Build custom image
docker build -f ops/docker/application/Dockerfile.custom -t webgrip/invoiceninja-application.application:custom .

# Update docker-compose.yml to use custom image
sed -i 's/:latest/:custom/' docker-compose.yml
```

### Configuration Customization

1. **Custom Environment Variables**

Add to `.env`:

```bash
# Custom feature flags
CUSTOM_FEATURE_ENABLED=true
CUSTOM_PAYMENT_GATEWAY=stripe
CUSTOM_LOGO_URL=https://yourcompany.com/logo.png

# Custom integrations
INTEGRATION_API_KEY=your-api-key
INTEGRATION_WEBHOOK_URL=https://api.yourservice.com/webhook
```

2. **Custom Configuration Files**

```bash
# Create custom configuration
make run CMD="php artisan vendor:publish --tag=config"

# Edit published configuration files
# config/invoiceninja.php
# config/custom-features.php
```

## Testing Procedures

### Unit Testing

```bash
# Run all tests
make run CMD="php artisan test"

# Run specific test suite
make run CMD="php artisan test --testsuite=Feature"

# Run with coverage
make run CMD="php artisan test --coverage"

# Run specific test
make run CMD="php artisan test tests/Feature/InvoiceTest.php"
```

### Integration Testing

```bash
# Database integration tests
make run CMD="php artisan test --group=database"

# API integration tests
make run CMD="php artisan test --group=api"

# Email integration tests
make run CMD="php artisan test --group=mail"
```

### Browser Testing

1. **Laravel Dusk Setup**

```bash
# Install Dusk
make run CMD="composer require --dev laravel/dusk"

# Install Dusk
make run CMD="php artisan dusk:install"

# Configure for headless testing
make run CMD="php artisan dusk:chrome-driver"
```

2. **Running Browser Tests**

```bash
# Run browser tests
make run CMD="php artisan dusk"

# Run specific browser test
make run CMD="php artisan dusk tests/Browser/LoginTest.php"

# Run with specific browser
make run CMD="php artisan dusk --env=testing"
```

### Performance Testing

1. **Load Testing Setup**

Create `tests/performance/load-test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  let response = http.get('http://localhost:8080');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

2. **Run Performance Tests**

```bash
# Install k6
curl https://github.com/grafana/k6/releases/download/v0.46.0/k6-v0.46.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1

# Run load test
./k6 run tests/performance/load-test.js

# Run with custom parameters
./k6 run --vus 50 --duration 60s tests/performance/load-test.js
```

### Security Testing

```bash
# Run security analysis
docker run --rm -v $(pwd):/app \
  laravelsecurity/enlightn \
  php artisan enlightn

# Check for known vulnerabilities
make run CMD="composer audit"

# Static analysis
docker run --rm -v $(pwd):/app \
  jakzal/phpqa:php8.2-alpine \
  phpstan analyse --level=max app/
```

## Build and Release Process

### Image Building

1. **Build Process**

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build invoiceninja-application.application

# Build with no cache
docker-compose build --no-cache
```

2. **Multi-stage Build Optimization**

Update `ops/docker/application/Dockerfile`:

```dockerfile
# Build stage
FROM composer:2 AS dependencies
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader

# Production stage
FROM php:8.2-fpm-alpine AS production
WORKDIR /var/www/html

# Copy dependencies from build stage
COPY --from=dependencies /app/vendor ./vendor

# Copy application files
COPY src/ ./
COPY --chown=www-data:www-data storage/ ./storage/

# Set permissions
RUN chown -R www-data:www-data /var/www/html

USER www-data
EXPOSE 9000
```

### Version Management

1. **Semantic Versioning**

```bash
# Tag release
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Build tagged image
docker build -t webgrip/invoiceninja-application.application:v1.2.3 .
docker build -t webgrip/invoiceninja-application.application:latest .
```

2. **Automated Release**

Create `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: |
          docker-compose build
          
      - name: Tag images
        run: |
          docker tag webgrip/invoiceninja-application.application:latest \
            webgrip/invoiceninja-application.application:${{ github.ref_name }}
            
      - name: Push images
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push webgrip/invoiceninja-application.application:${{ github.ref_name }}
          docker push webgrip/invoiceninja-application.application:latest
```

### Quality Assurance

1. **Pre-commit Hooks**

Create `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: php-cs-fixer
        name: PHP CS Fixer
        entry: make run CMD="vendor/bin/php-cs-fixer fix"
        language: system
        types: [php]
        
      - id: phpstan
        name: PHPStan
        entry: make run CMD="vendor/bin/phpstan analyse"
        language: system
        types: [php]
```

2. **CI/CD Pipeline**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start services
        run: make start
        
      - name: Wait for services
        run: make wait-ready URL=http://localhost:8080/health
        
      - name: Run tests
        run: make run CMD="php artisan test"
        
      - name: Run security checks
        run: make run CMD="composer audit"
```

## Contributing Guidelines

### Code Standards

1. **PHP Standards**

```bash
# Format code
make run CMD="vendor/bin/php-cs-fixer fix"

# Static analysis
make run CMD="vendor/bin/phpstan analyse"

# Check code style
make run CMD="vendor/bin/phpcs --standard=PSR12 app/"
```

2. **Commit Standards**

Follow Conventional Commits:

```bash
# Feature addition
git commit -m "feat: add custom payment gateway integration"

# Bug fix
git commit -m "fix: resolve invoice calculation error"

# Documentation
git commit -m "docs: update installation instructions"

# Configuration
git commit -m "chore: update Docker base image"
```

### Pull Request Process

1. **Branch Naming**

```bash
# Feature branches
git checkout -b feature/custom-payment-gateway

# Bug fix branches
git checkout -b fix/invoice-calculation-error

# Documentation branches
git checkout -b docs/installation-guide
```

2. **PR Template**

Create `.github/pull_request_template.md`:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings or errors
```

### Development Best Practices

1. **Code Organization**

```
src/
├── app/
│   ├── Http/Controllers/     # API controllers
│   ├── Models/              # Eloquent models
│   ├── Services/            # Business logic
│   └── Modules/             # Custom modules
├── config/                  # Configuration files
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/            # Database seeders
├── resources/
│   ├── views/              # Blade templates
│   └── assets/             # Frontend assets
└── tests/
    ├── Unit/               # Unit tests
    ├── Feature/            # Feature tests
    └── Browser/            # Browser tests
```

2. **Environment Management**

```bash
# Development
ENV_FILE=.env.development make start

# Testing
ENV_FILE=.env.testing make run CMD="php artisan test"

# Staging
ENV_FILE=.env.staging make start

# Production
ENV_FILE=.env.production make start
```

## Sources

Development guidelines are based on Laravel best practices and Docker development workflows:

- **Laravel Development Documentation**, https://laravel.com/docs/10.x, Retrieved 2025-01-09
- **Docker Development Best Practices**, https://docs.docker.com/develop/dev-best-practices/, Retrieved 2025-01-09
- **Invoice Ninja Developer Documentation**, https://invoiceninja.github.io/en/developer-guide/, Retrieved 2025-01-09
- **Conventional Commits Specification**, https://www.conventionalcommits.org/, Retrieved 2025-01-09