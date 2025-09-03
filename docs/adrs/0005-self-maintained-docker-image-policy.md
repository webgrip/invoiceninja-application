# ADR-0005: Self-Maintained Docker Image Policy

## Status

**Accepted** - 2025-01-15

## Context

The invoiceninja-application project requires a robust, secure, and maintainable containerization strategy for local development and production deployment. Key requirements include:

- **Security**: Minimize attack surface and maintain control over base images
- **Reproducibility**: Ensure consistent builds across environments
- **Maintainability**: Clear ownership and update policies for all images
- **Performance**: Optimal startup times and resource usage
- **Developer Experience**: Simple, reliable local development workflow

## Decision

We implement a **self-maintained image policy** where the organization owns and maintains all container images used in the application stack.

### Core Policy Principles

1. **Own Every Image**: All services use `webgrip/invoiceninja-application.{service}` naming convention
2. **Upstream as Base**: Build FROM official images with exact pinned tags (e.g., `node:20.11.1-alpine`)
3. **Minimal Overlay**: Only add essential packages and configurations to upstream images
4. **Compose Isolation**: docker-compose.yml references only org-owned images, never upstream directly
5. **Port Hygiene**: Only reverse proxy publishes host ports, all other services use internal networking

### Service Architecture

- **Application**: Node.js 20.11.1-alpine with health check support
- **Nginx**: 1.26.2-alpine as reverse proxy with custom configuration
- **MariaDB**: 11.6.2-noble as primary database with UTF8MB4 support
- **Redis**: 7.4.2-alpine for caching and session storage
- **PostgreSQL**: 17.2-alpine as alternative database (disabled by default)
- **mkcert**: Alpine-based for local SSL certificate generation

### Security Implementation

- **Non-root users**: All services run with dedicated user accounts
- **Health checks**: Comprehensive monitoring for all services
- **Internal networking**: Services communicate via Docker internal networks
- **Minimal packages**: Only curl added for health checks, no unnecessary tools

## Alternatives Considered

### Direct Upstream Usage
- **Pros**: Simpler initial setup, automatic updates
- **Cons**: No control over updates, potential security vulnerabilities, dependency on external images

### Third-party Base Images
- **Pros**: Pre-configured environments, additional features
- **Cons**: Lack of transparency, potential bloat, unknown security posture

### Monolithic Container
- **Pros**: Single container management, simpler deployment
- **Cons**: Poor separation of concerns, difficult scaling, larger attack surface

## Consequences

### Positive

- **Security Control**: Full ownership and visibility into all container images
- **Predictable Updates**: Controlled update cycles for base images and dependencies
- **Minimal Attack Surface**: Only essential packages in production images
- **Reproducible Builds**: Exact version pinning ensures consistent behavior
- **Clear Ownership**: Unambiguous responsibility for image maintenance and security

### Negative

- **Maintenance Overhead**: Regular monitoring and updating of base images required
- **Build Complexity**: Multiple Dockerfiles to maintain across services
- **Storage Requirements**: Organization registry storage for all images

### Neutral

- **Developer Workflow**: `make start` → working stack remains simple
- **CI/CD Integration**: Standard Docker build processes, compatible with existing pipelines

## Implementation Details

### Directory Structure
```
ops/docker/
├── application/Dockerfile    # Node.js application server
├── nginx/Dockerfile         # Reverse proxy with config
├── mariadb/Dockerfile       # Database with optimizations
├── redis/Dockerfile         # Cache service
├── postgres/Dockerfile      # Alternative database
└── mkcert/Dockerfile        # SSL certificate generation
```

### Health Check Strategy
All services implement appropriate health checks:
- **Application**: HTTP health endpoint
- **Databases**: Connection and query tests
- **Redis**: PING command
- **Nginx**: HTTP proxy health check

### Version Management
- Base images pinned to specific minor versions (e.g., `20.11.1`, not `20` or `latest`)
- Regular security scanning and updates through automated processes
- Documentation of version decisions and upgrade paths

## Compliance

This decision ensures compliance with:
- **Container Security Best Practices**: Non-root users, minimal images, health monitoring
- **Supply Chain Security**: Known and controlled dependencies
- **DevOps Principles**: Infrastructure as Code, reproducible builds
- **Organizational Policies**: Self-maintained infrastructure components

## Review Schedule

- **Quarterly**: Review base image versions and security updates
- **Bi-annually**: Assess policy effectiveness and consider alternatives
- **As-needed**: Security vulnerability response and critical updates

## References

- [Container Security Best Practices](https://kubernetes.io/docs/concepts/security/overview/)
- [Docker Official Images Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [NIST Container Security Guide](https://www.nist.gov/publications/application-container-security-guide)
- [CIS Docker Benchmark](https://www.cisecurity.org/benchmark/docker)