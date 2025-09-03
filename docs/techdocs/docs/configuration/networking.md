---
title: "Network Configuration"
description: "Network setup, port mappings, and service discovery for the Invoice Ninja deployment"
tags:
  - configuration
  - networking
  - docker
  - ports
search:
  boost: 3
  exclude: false
icon: material/network-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Network Configuration

## Docker Compose Networking

- **Network Name:** `webgrip` (external)
- **Network Type:** Bridge network
- **DNS Resolution:** Automatic container name resolution
- **External Access:** Only application service exposed on localhost

## Port Mappings

| Service | Internal Port | External Port | Access |
|---------|---------------|---------------|--------|
| Application | 8080 | 8080 | localhost:8080 |
| MariaDB | 3306 | 3306 | localhost:3306 (development) |
| PostgreSQL | 5432 | 5432 | localhost:5432 (development) |
| Redis | 6379 | None | Internal only |

## Service Discovery

Services communicate using Docker Compose service names:
- `invoiceninja-application.application`
- `invoiceninja-application.mariadb`
- `invoiceninja-application.redis`
- `invoiceninja-application.postgres`

## Sources

- **Docker Compose File Reference**, https://docs.docker.com/compose/compose-file/, Retrieved 2025-01-09