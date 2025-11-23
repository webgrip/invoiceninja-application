---
title: "Project Overview"
description: "Description of what the invoiceninja-application project is and which upstream applications it packages"
tags:
  - project
  - overview
  - architecture
  - upstream
search:
  boost: 4
  exclude: false
icon: material/information-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Project Overview

**Purpose Statement:** This document describes what the invoiceninja-application project is and which upstream applications it packages.

## Table of Contents

- [Project Description](#project-description)
- [Upstream Application](#upstream-application)
- [Architecture Overview](#architecture-overview)
- [Image Policy](#image-policy)
- [Repository Structure](#repository-structure)

## Project Description

The invoiceninja-application project is a containerized deployment solution that packages and manages the Invoice Ninja invoicing and billing application. This repository provides production-ready Docker containers, Kubernetes manifests, and operational tooling for deploying Invoice Ninja in enterprise environments.

Invoice Ninja is a comprehensive, open-source invoicing and billing platform that helps businesses manage their financial operations including invoice creation, payment processing, expense tracking, and client management.

## Upstream Application

**Primary Application:** Invoice Ninja v5.x  
**Official Repository:** https://github.com/invoiceninja/invoiceninja  
**Official Documentation:** https://invoiceninja.github.io/  
**Official Docker Images:** https://hub.docker.com/r/invoiceninja/invoiceninja  

## Architecture Overview

This deployment consists of the following components:

### Core Services

- **Invoice Ninja Application** - Laravel-based web application
- **MariaDB Database** - Primary data storage
- **Redis Cache** - Session storage and caching
- **Alternative Database Support** - PostgreSQL (configurable)

### Container Images

All images are built and maintained by webgrip organization:

- `webgrip/invoiceninja-application.application:latest` - Main Invoice Ninja application
- `webgrip/invoiceninja-application.nginx:latest` - Nginx reverse proxy
- `webgrip/invoiceninja-application.mariadb:latest` - MariaDB database with optimizations
- `webgrip/invoiceninja-application.redis:latest` - Redis cache server
- `webgrip/invoiceninja-application.postgres:latest` - PostgreSQL alternative (optional)

### Version Compatibility Matrix

The following versions are tested and supported in this deployment:

| Component | Version | Base Image | Status | Notes |
|-----------|---------|------------|--------|-------|
| Invoice Ninja | 5.12.33 | `invoiceninja/invoiceninja:5.12.33` | ✓ Production | Laravel-based application |
| Nginx | 1.26.2 | `nginx:1.26.2-alpine` | ✓ Production | Reverse proxy with SSL support |
| MariaDB | 11.6.2 | `mariadb:11.6.2-noble` | ✓ Production | Primary database (recommended) |
| Redis | 7.4.2 | `redis:7.4.2-alpine` | ✓ Production | Cache and session storage |
| PostgreSQL | 17.2 | `postgres:17.2-alpine` | ○ Optional | Alternative database option |
| PHP | 8.3 | Included in Invoice Ninja | ✓ Production | Required by Invoice Ninja |
| Laravel | 10.x | Included in Invoice Ninja | ✓ Production | Application framework |

**Legend:**
- ✓ Production: Fully tested and production-ready
- ○ Optional: Available but not required
- ⚠ Development: For development use only

**Update Policy:**
- Invoice Ninja: Updated monthly or for critical security patches
- Base images: Updated quarterly for minor versions, immediately for security issues
- All updates are tested before deployment to production

## Image Policy

**Organizational Policy:** All production deployments use organization-built images to ensure:

- Security scanning and vulnerability management
- Consistent base image standards
- Controlled update cycles
- Compliance with enterprise requirements

**Base Image Strategy:** Images are built on pinned upstream official bases with minimal modification layers for security and maintainability.

## Repository Structure

```
├── docs/                    # Documentation
│   ├── adrs/               # Architectural Decision Records
│   └── techdocs/           # MkDocs technical documentation
├── ops/                    # Operations and deployment
│   ├── docker/             # Dockerfiles for all services
│   ├── helm/               # Kubernetes Helm charts
│   └── secrets/            # Encrypted secrets management
├── src/                    # Application source (if customizations exist)
├── tests/                  # Test suites
├── docker-compose.yml      # Local development environment
└── Makefile               # Operational commands
```

## Sources

All information in this document is derived from official Invoice Ninja sources and verified on 2025-11-23:

- **Invoice Ninja Official Documentation**, https://invoiceninja.github.io/, Retrieved 2025-11-23
- **Invoice Ninja GitHub Repository**, https://github.com/invoiceninja/invoiceninja, Retrieved 2025-11-23
- **Invoice Ninja Docker Hub**, https://hub.docker.com/r/invoiceninja/invoiceninja, Retrieved 2025-11-23