# Invoice Ninja Application Helm Charts

This directory contains Helm charts for deploying Invoice Ninja using the community chart as a dependency.

## Structure

- **Main Chart**: `ops/helm/invoiceninja-application/` - The main application chart
- **Secrets Chart**: `ops/secrets/invoiceninja-application-secrets/` - Chart for managing secrets (install first)

## Community Chart Used

This deployment uses the actively maintained community chart from:
- **Repository**: https://github.com/Saddamus/invoiceninja-helm
- **Chart Version**: 0.1.0
- **Application Version**: 5.0.52

## Prerequisites

1. Kubernetes cluster with Helm 3.x installed
2. cert-manager for TLS certificates
3. Traefik ingress controller
4. Storage class `do-block-storage` configured

## Installation Instructions

### Step 1: Install Secrets Chart (Required First)

```bash
# 1. Copy and edit the secrets values
cp ops/secrets/invoiceninja-application-secrets/values.dec.yaml.example my-secrets-values.yaml

# 2. Edit my-secrets-values.yaml and fill in all REQUIRED values:
#    - mysql_password: Strong password for MySQL user
#    - mysql_root_password: Strong password for MySQL root
#    - app_key: Generate with: php artisan key:generate --show
#    - mail_password: SMTP password
#    - api_secret: Random string for API

# 3. Install the secrets chart
helm upgrade --install invoiceninja-application-secrets \
  ops/secrets/invoiceninja-application-secrets/ \
  -n invoiceninja-application \
  --create-namespace \
  -f my-secrets-values.yaml
```

### Step 2: Install Main Application Chart

```bash
# 1. Copy and edit the main values
cp ops/helm/invoiceninja-application/values.yaml my-app-values.yaml

# 2. Edit my-app-values.yaml and fill in all REQUIRED values (search for "REQUIRED"):
#    - _shared_config.hostname: Your domain (e.g., invoice.yourdomain.com)
#    - _shared_config.url: Full URL (e.g., https://invoice.yourdomain.com)
#    - invoiceninja.dbpass: Same password as mysql_password in secrets
#    - invoiceninja.envconfig.APP_URL: Same as _shared_config.url
#    - invoiceninja.envconfig.APP_KEY: Same as app_key in secrets
#    - invoiceninja.envconfig.DB_PASSWORD1: Same as mysql_password in secrets
#    - invoiceninja.envconfig.MAIL_* fields: Configure SMTP settings
#    - invoiceninja.ingress.hosts[0].host: Your domain
#    - invoiceninja.ingress.tls[0].hosts[0]: Your domain

# 3. Install the main application chart
helm upgrade --install invoiceninja-application \
  ops/helm/invoiceninja-application/ \
  -n invoiceninja-application \
  -f my-app-values.yaml
```

## Required Configuration Fields

Before installation, you must configure these fields:

### Domain and URLs
- `_shared_config.hostname`: Your Invoice Ninja domain
- `_shared_config.url`: Full HTTPS URL to your instance
- `invoiceninja.envconfig.APP_URL`: Same as _shared_config.url
- Ingress host and TLS settings

### Database
- `invoiceninja.dbpass`: Strong database password
- `invoiceninja.envconfig.DB_PASSWORD1`: Same as dbpass
- Secret: `mysql_password` and `mysql_root_password`

### Application Security
- Secret: `app_key` - Generate with Laravel: `php artisan key:generate --show`
- `invoiceninja.envconfig.APP_KEY`: Same as secret app_key

### Email Configuration
- `invoiceninja.envconfig.MAIL_FROM_NAME`: Your company name
- `invoiceninja.envconfig.MAIL_FROM_ADDRESS`: Sender email
- `invoiceninja.envconfig.MAIL_HOST`: SMTP server
- `invoiceninja.envconfig.MAIL_USERNAME`: SMTP username
- Secret: `mail_password` - SMTP password

## Validation

Test your configuration with:

```bash
# Lint the charts
helm lint ops/helm/invoiceninja-application/
helm lint ops/secrets/invoiceninja-application-secrets/

# Dry run test
helm template test-secrets ops/secrets/invoiceninja-application-secrets/ -f my-secrets-values.yaml
helm template test-app ops/helm/invoiceninja-application/ -f my-app-values.yaml
```

## Chart Dependencies

The main chart includes these dependencies:
- **invoiceninja**: Community Invoice Ninja chart (local subchart)
- **mysql**: Bitnami MySQL 14.0.3 for database
- **redis**: Bitnami Redis 22.0.7 for caching and sessions
- **common-helpers**: WebGrip common chart helpers

## Storage and Resources

Default resource allocation:
- **Invoice Ninja App**: 250m CPU request, 1000m limit, 512Mi-1Gi memory
- **MySQL**: 100m-500m CPU, 256Mi-512Mi memory, 8Gi persistent storage
- **Redis**: 100m-200m CPU, 128Mi-256Mi memory, 2Gi persistent storage
- **App Storage**: 10Gi persistent volume for Invoice Ninja data

## Security

The deployment includes:
- Non-root security context
- Resource limits and requests
- TLS certificates via cert-manager
- Secrets stored in Kubernetes Secret objects
- Network policies (via MySQL and Redis subcharts)

## Troubleshooting

1. **Check pod status**: `kubectl get pods -n invoiceninja-application`
2. **Check logs**: `kubectl logs -n invoiceninja-application deployment/invoiceninja-application-invoiceninja`
3. **Check ingress**: `kubectl get ingress -n invoiceninja-application`
4. **Check secrets**: `kubectl get secrets -n invoiceninja-application`

## Upgrading

To upgrade the application:

```bash
# Update the main chart
helm upgrade invoiceninja-application \
  ops/helm/invoiceninja-application/ \
  -n invoiceninja-application \
  -f my-app-values.yaml

# Update secrets (if needed)
helm upgrade invoiceninja-application-secrets \
  ops/secrets/invoiceninja-application-secrets/ \
  -n invoiceninja-application \
  -f my-secrets-values.yaml
```