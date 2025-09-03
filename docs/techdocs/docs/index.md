---
hide:
  - navigation
  - toc
search:
  boost: 2 
---

# Invoice Ninja Application Documentation

This documentation provides comprehensive information about the containerized Invoice Ninja application deployment maintained by webgrip.

## Purpose Statement

This documentation enables any engineer to understand what we built, why we built it this way, how to operate it safely, and how to evolve it—without leaving the repository.

## Table of Contents

- [Project Overview](project-overview.md) - What this project is and which upstream applications it packages
- [Upstream Application](upstream-application.md) - Facts about Invoice Ninja derived from official sources
- [Configuration](configuration.md) - Environment variables, volumes, and service settings
- [Deployment](deployment.md) - How to deploy and manage the application
- [Operations](operations.md) - Day-to-day operational procedures
- [Troubleshooting](troubleshooting.md) - Common issues and solutions
- [Development](development.md) - Development workflow and customization

## Quick Start

1. Clone this repository
2. Copy `.env.example` to `.env` and configure database credentials
3. Run `make start` to start the application stack
4. Access Invoice Ninja at `http://localhost:8080`

For detailed instructions, see the [Deployment Guide](deployment.md).

## Image Policy

This repository builds and maintains organization-owned container images based on official upstream sources. Our Docker Compose configuration uses only our custom-built images to ensure consistency and security.
