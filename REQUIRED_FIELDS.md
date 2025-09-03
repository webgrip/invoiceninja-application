# Required Fields Summary

## Operator Must Configure Before Installation

### 1. Main Chart: `ops/helm/application-application/values.yaml`

Search for `# REQUIRED` and configure:

```yaml
_shared_config:
  hostname: &hostname your-domain.example.com  # REQUIRED: Replace with your FQDN
  url: &url https://your-domain.example.com    # REQUIRED: Replace with your URL
```

### 2. Secrets Chart: `ops/secrets/application-application-secrets/values.yaml`

**ALL** secret values must be set:

```yaml
# Database Authentication
db-password: "your-secure-db-password"           # REQUIRED: MariaDB user password
db-root-password: "your-secure-root-password"   # REQUIRED: MariaDB root password

# Application Security
app-key: "base64:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"  # REQUIRED: Laravel APP_KEY
api-secret: "your-api-secret"                    # REQUIRED: API secret
user-password: "your-secure-admin-password"     # REQUIRED: Default admin password
```

## Installation Commands

```bash
# 1. Install secrets first
helm upgrade --install application-application-secrets \
  ops/secrets/application-application-secrets \
  -n invoiceninja-application --create-namespace

# 2. Install main application  
helm upgrade --install application-application \
  ops/helm/application-application \
  -n invoiceninja-application
```

## Validation Commands

```bash
helm lint ops/helm/application-application
helm lint ops/secrets/application-application-secrets

helm upgrade --install application-application-secrets ops/secrets/application-application-secrets -n invoiceninja-application --create-namespace --dry-run --debug
helm upgrade --install application-application ops/helm/application-application -n invoiceninja-application --dry-run --debug
```