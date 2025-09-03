---
title: "Prerequisites"
description: "System requirements and prerequisite setup for Invoice Ninja deployment"
tags:
  - deployment
  - prerequisites
  - requirements
  - setup
search:
  boost: 3
  exclude: false
icon: material/check-circle-outline
author: "WebGrip Infrastructure Team"
date: 2025-01-09
---

# Prerequisites

## System Requirements

- **Docker Engine:** 20.10+ with Docker Compose V2
- **Operating System:** Linux (Ubuntu 20.04+, RHEL 8+, or equivalent)
- **Memory:** 4GB RAM minimum (8GB recommended for production)
- **Storage:** 20GB available space (SSD recommended)
- **Network:** Outbound internet access for image pulls and updates

## Required Tools

Install the following tools on the deployment host:

```bash
# Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Make (usually pre-installed)
sudo apt-get update && sudo apt-get install -y make

# Age for secret encryption (optional)
sudo apt-get install -y age

# SOPS for secret management (optional)
curl -LO https://github.com/mozilla/sops/releases/download/v3.8.1/sops-v3.8.1.linux.amd64
sudo mv sops-v3.8.1.linux.amd64 /usr/local/bin/sops
sudo chmod +x /usr/local/bin/sops
```

## Network Setup

Ensure the following ports are available:

- **8080/tcp** - Application web interface
- **3306/tcp** - MariaDB (development only, if used)
- **5432/tcp** - PostgreSQL (development only, alternative database)

## Verification

Verify your system meets the requirements:

```bash
# Check Docker version
docker --version
docker compose version

# Check available memory
free -h

# Check available disk space
df -h

# Check network connectivity
curl -I https://hub.docker.com
```