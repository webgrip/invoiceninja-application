---
title: "Initial Setup"
description: "First-time deployment configuration for the Invoice Ninja application"
tags:
  - deployment
  - setup
  - configuration
  - environment
search:
  boost: 4
  exclude: false
icon: material/cog-sync-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Initial Setup

## 1. Repository Clone and Configuration

```bash
# Clone the repository
git clone https://github.com/webgrip/invoiceninja-application.git
cd invoiceninja-application

# Copy and configure environment
cp .env.example .env
```

## 2. Environment Configuration

Edit `.env` file with your specific settings:

```bash
# Required: Set strong database credentials
DB_DATABASE=invoiceninja
DB_USERNAME=invoiceninja_user
DB_PASSWORD=<generate-strong-password>
DB_ROOT_PASSWORD=<generate-strong-root-password>

# Required: Set your domain
SUBDOMAIN=invoiceninja
DOMAIN_NAME=yourcompany.com
APP_URL=https://invoiceninja.yourcompany.com

# Required: Application key (will be generated)
APP_KEY=

# Recommended: Mail configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-server.com
MAIL_PORT=587
MAIL_USERNAME=your-email@yourcompany.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourcompany.com
MAIL_FROM_NAME="Your Company Invoices"
```

## 3. Secret Management (Production)

For production deployments, use encrypted secrets:

```bash
# Initialize age encryption
make secrets:init

# Add your secrets to the decrypted file
nano ops/secrets/invoiceninja-application-secrets/values.dec.yaml

# Encrypt the secrets
make secrets:encrypt SECRETS_DIR=./ops/secrets/invoiceninja-application-secrets

# Add the age key to your deployment environment
export SOPS_AGE_KEY=$(cat .age.key)
```

## 4. Network Setup

Create the required Docker network:

```bash
# Create external network
docker network create webgrip
```

## Next Steps

After completing initial setup, proceed to [Deployment Procedures](procedures.md) for the actual deployment process.