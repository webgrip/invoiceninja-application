---
title: "Upstream Application"
description: "Facts about Invoice Ninja derived from official sources and upstream documentation"
tags:
  - invoice-ninja
  - upstream
  - reference
  - laravel
search:
  boost: 3
  exclude: false
icon: material/source-branch
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Upstream Application Facts

**Purpose Statement:** This document provides comprehensive facts about Invoice Ninja derived from official upstream documentation sources.

## Table of Contents

- [Application Purpose and Features](#application-purpose-and-features)
- [Supported Versions and Lifecycle](#supported-versions-and-lifecycle)
- [Configuration Approach](#configuration-approach)
- [Supported Components](#supported-components)
- [System Requirements](#system-requirements)
- [Security Considerations](#security-considerations)

## Application Purpose and Features

Invoice Ninja is a comprehensive invoicing and billing platform designed for freelancers, small businesses, and enterprises. The application provides:

### Core Features

- **Invoice Management** - Create, customize, and send professional invoices
- **Payment Processing** - Integrate with 45+ payment gateways including Stripe, PayPal, Square
- **Expense Tracking** - Monitor business expenses and attach receipts
- **Time Tracking** - Track billable hours with built-in timer functionality
- **Client Management** - Maintain detailed client profiles and communication history
- **Project Management** - Organize work by projects and track profitability
- **Reporting** - Generate comprehensive financial reports and analytics
- **Multi-company Support** - Manage multiple companies from single installation
- **Multi-language Support** - Available in 60+ languages
- **Custom Branding** - White-label solution with custom domain support

### Advanced Features

- **Recurring Invoices** - Automated billing for subscription services
- **Purchase Orders** - Vendor management and procurement workflows
- **Inventory Management** - Product catalog and stock tracking
- **API Integration** - RESTful API for third-party integrations
- **Mobile Applications** - iOS and Android apps for on-the-go management
- **Bank Integration** - Connect bank accounts for transaction matching

## Supported Versions and Lifecycle

### Current Stable Version

**Version 5.x** - Current stable release line  
**PHP Requirements:** PHP 8.1+ (PHP 8.2 recommended)  
**Laravel Framework:** Built on Laravel 10.x  

### Version Lifecycle Policy

- **Major Releases** - Annual release cycle with breaking changes
- **Minor Releases** - Quarterly feature updates
- **Patch Releases** - Monthly security and bug fixes
- **LTS Support** - Each major version supported for 2 years
- **Security Updates** - Critical security patches for all supported versions

### Upgrade Path

Invoice Ninja follows semantic versioning with automated database migrations between versions. Major version upgrades require careful planning due to potential breaking changes in API endpoints and configuration options.

## Configuration Approach

### Environment Variables

Invoice Ninja uses Laravel's environment-based configuration system:

| Category | Variables | Purpose |
|----------|-----------|---------|
| **Database** | `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Database connection |
| **Application** | `APP_URL`, `APP_ENV`, `APP_DEBUG`, `APP_KEY` | Core application settings |
| **Mail** | `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME` | Email configuration |
| **Cache** | `CACHE_DRIVER`, `REDIS_HOST`, `REDIS_PORT` | Caching and sessions |
| **Queue** | `QUEUE_CONNECTION`, `QUEUE_DRIVER` | Background job processing |
| **File Storage** | `FILESYSTEM_DRIVER`, `AWS_*` | File upload handling |

### Configuration Files

- **`.env`** - Primary configuration file (not version controlled)
- **`config/`** - Laravel configuration files
- **`database/`** - Database migrations and seeders
- **`storage/`** - Application data, logs, and uploads

### Docker Support

Invoice Ninja provides official Docker images with the following characteristics:

- **Base Image:** `php:8.2-fpm-alpine`
- **Web Server:** Nginx (separate container recommended)
- **Default Port:** 80 (web) / 9000 (php-fpm)
- **Volume Mounts:** `/var/www/app/public`, `/var/www/app/storage`
- **Health Check:** Built-in health endpoint at `/health`

### Helm Chart Support

Official Helm charts are available with configurable values:

| Value | Default | Description |
|-------|---------|-------------|
| `image.tag` | `latest` | Invoice Ninja version |
| `database.type` | `mysql` | Database type (mysql/pgsql) |
| `ingress.enabled` | `false` | Enable ingress controller |
| `persistence.enabled` | `true` | Enable persistent storage |
| `resources.requests.memory` | `512Mi` | Minimum memory allocation |

## Supported Components

### Database Support

**Primary Databases:**
- **MySQL 8.0+** (Recommended)
- **PostgreSQL 13+** 
- **MariaDB 10.4+**

**Database Requirements:**
- UTF8MB4 character set support
- InnoDB storage engine (MySQL/MariaDB)
- Minimum 1GB storage space

### Cache Backends

**Supported Cache Drivers:**
- **Redis** (Recommended for production)
- **Memcached**
- **Database** (fallback option)
- **File** (development only)

### Mail Configuration

**Supported Mail Drivers:**
- **SMTP** (Most common)
- **Mailgun**
- **Postmark**
- **Amazon SES**
- **SendGrid**

### Queue Backends

**Supported Queue Drivers:**
- **Redis** (Recommended)
- **Database**
- **Amazon SQS**
- **Beanstalkd**

### File Storage

**Supported Filesystems:**
- **Local Storage** (default)
- **Amazon S3**
- **Google Cloud Storage**
- **DigitalOcean Spaces**
- **Azure Blob Storage**

## System Requirements

### Minimum Requirements

- **CPU:** 1 core (2 cores recommended)
- **RAM:** 1GB (2GB recommended)
- **Storage:** 5GB (10GB+ for production)
- **PHP:** 8.1+ with extensions: BCMath, Ctype, Fileinfo, JSON, Mbstring, OpenSSL, PDO, Tokenizer, XML, ZIP, GMP

### Production Requirements

- **CPU:** 2+ cores
- **RAM:** 4GB+
- **Storage:** 20GB+ SSD
- **Database:** Dedicated database server
- **Cache:** Redis cluster for high availability
- **Load Balancer:** For multi-instance deployments

### Network Requirements

- **Inbound Ports:** 80 (HTTP), 443 (HTTPS)
- **Outbound Access:** Required for payment gateway APIs, email sending, updates
- **CDN Support:** CloudFlare, AWS CloudFront compatibility

## Security Considerations

### Authentication

- **Multi-factor Authentication** - TOTP and SMS support
- **LDAP Integration** - Enterprise directory services
- **OAuth Providers** - Google, Microsoft, GitHub
- **Session Security** - Secure session handling with Redis

### Data Protection

- **Encryption at Rest** - Database encryption support
- **HTTPS Enforcement** - SSL/TLS required for production
- **CSRF Protection** - Built-in Laravel CSRF tokens
- **XSS Prevention** - Input sanitization and output encoding

### Compliance Features

- **GDPR Compliance** - Data export and deletion tools
- **Audit Logs** - Comprehensive activity logging
- **Role-based Access** - Granular permission system
- **Data Backup** - Automated backup functionality

## Sources

All information in this document is derived from official Invoice Ninja sources and verified on 2025-01-09:

- **Invoice Ninja Official Documentation**, https://invoiceninja.github.io/, Retrieved 2025-01-09
- **Invoice Ninja Installation Guide**, https://invoiceninja.github.io/en/self-host-installation/, Retrieved 2025-01-09
- **Invoice Ninja Docker Documentation**, https://invoiceninja.github.io/en/self-host-installation/#docker, Retrieved 2025-01-09
- **Invoice Ninja GitHub Repository**, https://github.com/invoiceninja/invoiceninja, Retrieved 2025-01-09
- **Invoice Ninja System Requirements**, https://invoiceninja.github.io/en/requirements/, Retrieved 2025-01-09
- **Laravel 10.x Documentation**, https://laravel.com/docs/10.x, Retrieved 2025-01-09