---
title: "Security Configuration"
description: "Security settings and best practices for the Invoice Ninja deployment"
tags:
  - configuration
  - security
  - best-practices
  - compliance
search:
  boost: 4
  exclude: false
icon: material/security
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Security Configuration

## Container Security

- **User Context:** Non-root user (where applicable)
- **Read-only Filesystem:** Applied to non-data directories
- **Capabilities:** Minimal required capabilities only
- **Security Scanning:** Regular vulnerability scanning enabled

## Network Security

- **Principle of Least Exposure:** Only application port exposed externally
- **Internal Communication:** Database and cache services not exposed
- **Firewall Rules:** Restrict access to management ports
- **TLS Encryption:** HTTPS required for production deployments

## Secret Management

- **Environment Files:** `.env` files excluded from version control
- **SOPS Encryption:** Sensitive configuration encrypted with age
- **Key Management:** Age keys stored in GitHub secrets
- **Rotation Policy:** Regular secret rotation recommended

## Compliance Considerations

- **Data Encryption:** Database encryption enabled for sensitive data
- **Audit Logging:** Application-level audit trails enabled
- **Access Controls:** Role-based access control within application
- **Backup Encryption:** Encrypted backups with separate key management