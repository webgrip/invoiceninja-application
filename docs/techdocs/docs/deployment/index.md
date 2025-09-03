---
title: "Deployment Overview"
description: "Overview of deployment procedures for the Invoice Ninja application"
tags:
  - deployment
  - overview
  - quickstart
  - docker-compose
search:
  boost: 4
  exclude: false
icon: material/rocket-launch-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Deployment Overview

This section provides comprehensive information about deploying and managing the Invoice Ninja application.

## Deployment Areas

- [Prerequisites](prerequisites.md) - System requirements and setup
- [Initial Setup](initial-setup.md) - First-time deployment configuration
- [Deployment Procedures](procedures.md) - Step-by-step deployment process
- [Upgrade Procedures](upgrades.md) - Application updates and maintenance
- [Rollback Procedures](rollbacks.md) - Recovery and rollback procedures
- [Production Considerations](production.md) - Production-specific configuration

## Quick Start

For immediate deployment on a clean system:

```bash
git clone https://github.com/webgrip/invoiceninja-application.git
cd invoiceninja-application
cp .env.example .env
# Edit .env with your configuration
make start
```

Access the application at `http://localhost:8080` after startup completes.

See [Initial Setup](initial-setup.md) for detailed configuration instructions.