---
title: "Configuration Overview"
description: "Overview of all configuration options for the Invoice Ninja application deployment"
tags:
  - configuration
  - overview
  - environment-variables
  - docker-compose
search:
  boost: 4
  exclude: false
icon: material/cog-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Configuration Overview

This section provides comprehensive information about configuring the Invoice Ninja application deployment.

## Configuration Areas

- [Environment Variables](environment-variables.md) - All required and optional environment variables
- [Volume Mounts](volumes.md) - Data persistence and volume configuration
- [Service Configuration](services.md) - Docker Compose service definitions
- [Network Configuration](networking.md) - Network setup and port mappings
- [Security Configuration](security.md) - Security settings and best practices

## Quick Reference

For quick deployment, copy `.env.example` to `.env` and configure these required variables:

- `APP_KEY` - Generate with `make generate-key`
- `DB_PASSWORD` - Strong database password
- `MAIL_*` - SMTP configuration for production

See [Environment Variables](environment-variables.md) for complete details.