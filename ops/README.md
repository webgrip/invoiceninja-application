# Invoice Ninja Application - Helm Deployment Guide

This directory contains complete Helm charts for deploying the Invoice Ninja application with all dependencies.

## Charts Overview

### 1. Secrets Chart: `ops/secrets/application-application-secrets`
**Install FIRST** - Contains encrypted secrets required by the main application.

### 2. Main Application Chart: `ops/helm/application-application`
Main chart with application and all dependencies (Redis, MariaDB).

## Dependencies & Versions

All charts use **official or actively maintained community charts** with pinned versions:

- **bjw-s/app-template v4.2.0** (repo: `https://bjw-s-labs.github.io/helm-charts`)
- **bitnami/redis v22.0.7** (repo: `https://charts.bitnami.com/bitnami`)  
- **bitnami/mariadb v22.0.0** (repo: `https://charts.bitnami.com/bitnami`)
- **webgrip/common-helpers v1.0.13** (repo: `oci://ghcr.io/webgrip/common-charts`)

## Quick Start

### Prerequisites
- Helm 3.x installed
- kubectl configured for your cluster
- SOPS/age for secrets encryption (optional)

### Installation Order

1. **Setup secrets** (replace with your values):
   ```bash
   # Copy and edit the secrets template
   cp ops/secrets/application-application-secrets/values.yaml ops/secrets/application-application-secrets/values.dec.yaml
   # Edit values.dec.yaml with your actual secrets
   
   # Optional: Encrypt with SOPS
   make secrets:encrypt SECRETS_DIR=ops/secrets/application-application-secrets
   ```

2. **Install secrets chart FIRST**:
   ```bash
   helm upgrade --install application-application-secrets \
     ops/secrets/application-application-secrets \
     -n invoiceninja-application --create-namespace
   ```

3. **Install main application**:
   ```bash
   helm upgrade --install application-application \
     ops/helm/application-application \
     -n invoiceninja-application
   ```

## Required Configuration

### REQUIRED Fields in `ops/helm/application-application/values.yaml`

Search for `# REQUIRED` comments and update these values:

```yaml
_shared_config:
  hostname: &hostname your-domain.example.com  # REQUIRED: Your FQDN
  url: &url https://your-domain.example.com    # REQUIRED: Your full URL
```

### REQUIRED Fields in `ops/secrets/application-application-secrets/values.yaml`

All secret values must be set:

```yaml
# Database passwords
db-password: "your-secure-db-password"           # REQUIRED
db-root-password: "your-secure-root-password"   # REQUIRED

# Application secrets  
app-key: "base64:YOUR_LARAVEL_APP_KEY"          # REQUIRED
api-secret: "your-api-secret"                    # REQUIRED
user-password: "your-secure-admin-password"     # REQUIRED
```

## Complete Values Schema

The `values.yaml` file contains **ALL configurable options** from upstream charts:

- **Application section**: All bjw-s/app-template (common chart) options
- **Redis section**: All bitnami/redis v22.0.7 options  
- **MariaDB section**: All bitnami/mariadb v22.0.0 options

### Key Configuration Sections

1. **Application Configuration** (`application.*`):
   - Pod security, resources, probes
   - Environment variables
   - Ingress, services, persistence
   - ConfigMaps

2. **Redis Configuration** (`redis.*`):
   - Architecture (standalone/replication)
   - Authentication, persistence
   - Master/replica settings
   - Network policies

3. **MariaDB Configuration** (`mariadb.*`):
   - Database authentication
   - Persistence, backup settings
   - Security contexts
   - Network policies

## Image Policy

- **Organization image**: `docker.io/webgrip/invoiceninja-application`
- **Tag in Helm values**: `image.tag: "latest"` (CI/ops pins actual tags)
- **Pull policy**: `Always` for latest tag, `IfNotPresent` for pinned tags

## Validation Commands

Test your configuration before deployment:

```bash
# Lint charts
helm lint ops/helm/application-application
helm lint ops/secrets/application-application-secrets

# Dry-run installation  
helm upgrade --install application-application-secrets \
  ops/secrets/application-application-secrets \
  -n invoiceninja-application --create-namespace --dry-run --debug

helm upgrade --install application-application \
  ops/helm/application-application \
  -n invoiceninja-application --dry-run --debug
```

## Customization Examples

### Scaling Redis
```yaml
redis:
  replica:
    replicaCount: 2  # Enable Redis replicas
```

### Custom Storage Classes
```yaml
application:
  persistence:
    public:
      storageClass: "fast-ssd"
    storage:
      storageClass: "standard"

mariadb:
  primary:
    persistence:
      storageClass: "database-tier"
```

### Resource Limits
```yaml
application:
  controllers:
    main:
      containers:
        app:
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "1000m"
              memory: "1Gi"
```

## Troubleshooting

### Common Issues

1. **Secret not found**: Ensure secrets chart is installed first
2. **Ingress not working**: Check `className` and certificate configuration
3. **Pod not starting**: Check resource limits and node capacity
4. **Database connection**: Verify MariaDB service name and credentials

### Debug Commands

```bash
# Check pod status
kubectl get pods -n invoiceninja-application

# Check pod logs
kubectl logs -n invoiceninja-application deployment/application-application

# Check service connectivity  
kubectl get svc -n invoiceninja-application

# Check secrets
kubectl get secrets -n invoiceninja-application
```

## Upgrade Procedure

1. **Backup database** before upgrading
2. **Update dependencies**:
   ```bash
   helm dependency update ops/helm/application-application
   ```
3. **Upgrade secrets** (if needed):
   ```bash
   helm upgrade application-application-secrets ops/secrets/application-application-secrets -n invoiceninja-application
   ```
4. **Upgrade application**:
   ```bash
   helm upgrade application-application ops/helm/application-application -n invoiceninja-application
   ```

## Security Considerations

- All secrets are stored in Kubernetes secrets (base64 encoded)
- Consider using SOPS/age for secrets encryption at rest
- MariaDB and Redis have network policies enabled by default
- Containers run as non-root users with security contexts
- Pod security contexts enforce fsGroup and capabilities

## Support

For issues with:
- **Application logic**: Check Invoice Ninja documentation
- **Helm charts**: Check upstream chart documentation (bjw-s, bitnami)
- **Deployment**: Review this README and troubleshooting section