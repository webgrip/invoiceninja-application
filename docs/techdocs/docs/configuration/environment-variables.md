---
title: "Environment Variables"
description: "Complete reference for all environment variables used in the Invoice Ninja deployment"
tags:
  - configuration
  - environment-variables
  - reference
  - laravel
search:
  boost: 4
  exclude: false
icon: material/form-textbox
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Environment Variables

All configuration follows Laravel convention with `.env` file or environment variable injection.

## Required Environment Variables

| Variable | Purpose | Default | Constraints |
|----------|---------|---------|-------------|
| `APP_KEY` | Laravel application encryption key | *Must be generated* | 32-character base64 string |
| `APP_URL` | Base URL for the application | `http://localhost` | Must include protocol |
| `DB_HOST` | Database server hostname | `invoiceninja-application.mariadb` | Resolvable hostname |
| `DB_DATABASE` | Database name | `invoiceninja` | Must exist or be creatable |
| `DB_USERNAME` | Database username | `invoiceninja` | Must have full privileges |
| `DB_PASSWORD` | Database password | *Required* | Strong password recommended |

## Application Configuration

| Variable | Purpose | Default | Options |
|----------|---------|---------|---------|
| `APP_ENV` | Application environment | `production` | `local`, `staging`, `production` |
| `APP_DEBUG` | Enable debug mode | `false` | `true`, `false` (never true in production) |
| `APP_LOCALE` | Default application locale | `en` | ISO 639-1 language codes |
| `APP_TIMEZONE` | Application timezone | `UTC` | PHP timezone identifiers |
| `SUBDOMAIN` | Application subdomain | `invoiceninja-application` | DNS-safe string |
| `DOMAIN_NAME` | Primary domain | `webgrip.test` | Valid domain name |

## Database Configuration

| Variable | Purpose | Default | Constraints |
|----------|---------|---------|-------------|
| `DB_CONNECTION` | Database driver | `mysql` | `mysql`, `pgsql`, `mariadb` |
| `DB_PORT` | Database port | `3306` | 1-65535 |
| `DB_ROOT_PASSWORD` | Root database password | *Required for initialization* | MariaDB/MySQL only |

## Cache and Session Configuration

| Variable | Purpose | Default | Options |
|----------|---------|---------|---------|
| `CACHE_DRIVER` | Cache backend | `redis` | `redis`, `database`, `file` |
| `SESSION_DRIVER` | Session storage | `redis` | `redis`, `database`, `file` |
| `REDIS_HOST` | Redis server hostname | `invoiceninja-application.redis` | Resolvable hostname |
| `REDIS_PORT` | Redis server port | `6379` | 1-65535 |
| `REDIS_PASSWORD` | Redis authentication | *(empty)* | Optional, but recommended |
| `REDIS_DB` | Redis database number | `0` | 0-15 |

## Queue Configuration

| Variable | Purpose | Default | Options |
|----------|---------|---------|---------|
| `QUEUE_CONNECTION` | Queue backend | `redis` | `redis`, `database`, `sync` |
| `QUEUE_DRIVER` | Legacy queue setting | `redis` | Same as QUEUE_CONNECTION |

## Mail Configuration

| Variable | Purpose | Default | Required for Production |
|----------|---------|---------|-------------------------|
| `MAIL_MAILER` | Mail driver | `smtp` | Yes |
| `MAIL_HOST` | SMTP server | *(empty)* | Yes |
| `MAIL_PORT` | SMTP port | `587` | Yes |
| `MAIL_USERNAME` | SMTP username | *(empty)* | Yes |
| `MAIL_PASSWORD` | SMTP password | *(empty)* | Yes |
| `MAIL_ENCRYPTION` | SMTP encryption | `tls` | `tls`, `ssl`, `null` |
| `MAIL_FROM_ADDRESS` | Sender email | *(empty)* | Yes |
| `MAIL_FROM_NAME` | Sender name | *(empty)* | Yes |

## Optional Environment Variables

| Variable | Purpose | Default | Notes |
|----------|---------|---------|-------|
| `TZ` | Container timezone | `UTC` | System timezone |
| `LOG_CHANNEL` | Logging driver | `daily` | `daily`, `single`, `syslog` |
| `BROADCAST_DRIVER` | Real-time broadcasting | `null` | `pusher`, `redis`, `null` |
| `FILESYSTEM_DRIVER` | File storage | `local` | `local`, `s3`, `gcs` |

## Sources

- **Invoice Ninja Self-Hosting Guide**, https://invoiceninja.github.io/en/self-host/, Retrieved 2025-01-16
- **Laravel Configuration Documentation**, https://laravel.com/docs/10.x/configuration, Retrieved 2025-01-16