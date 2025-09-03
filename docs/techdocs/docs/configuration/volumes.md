---
title: "Volume Mounts and Persistence"
description: "Data persistence configuration and volume mount specifications for Invoice Ninja"
tags:
  - configuration
  - volumes
  - persistence
  - docker
  - backup
search:
  boost: 3
  exclude: false
icon: material/harddisk
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Volume Mounts and Persistence

## Application Data Volumes

| Container Path | Volume Name | Purpose | Backup Required |
|----------------|-------------|---------|-----------------|
| `/data` | `invoiceninja-application-application-data` | Application uploads, public assets | Yes |

## Database Data Volumes

| Container Path | Volume Name | Purpose | Backup Required |
|----------------|-------------|---------|-----------------|
| `/var/lib/mysql` | `invoiceninja-application-mariadb-data` | MariaDB database files | **Critical** |
| `/var/lib/postgresql/data` | `invoiceninja-application-postgres-data` | PostgreSQL database files (alternative) | **Critical** |

## Cache Data Volumes

| Container Path | Volume Name | Purpose | Backup Required |
|----------------|-------------|---------|-----------------|
| `/data` | `invoiceninja-application-redis-data` | Redis persistence | Recommended |

## Volume Characteristics

- **Persistence:** All named volumes persist data across container restarts
- **Performance:** Use SSD storage for database volumes in production
- **Backup Strategy:** Database volumes require daily backups with point-in-time recovery
- **Security:** Volumes should be encrypted at rest in production environments

## Sources

- **Docker Compose File Reference**, https://docs.docker.com/compose/compose-file/, Retrieved 2025-01-09