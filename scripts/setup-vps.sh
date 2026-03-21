#!/bin/bash
# =========================================================
# DigitalOcean Droplet - VPS Initial Setup Script
# Ubuntu 22.04 x64
# Run as root: bash setup-vps.sh
# =========================================================
set -e

echo "Starting VPS setup..."

# ─── 1. System update ────────────────────────────────────
apt-get update -y && apt-get upgrade -y

# ─── 2. Install Docker ───────────────────────────────────
curl -fsSL https://get.docker.com | bash

# ─── 3. Install Docker Compose plugin ────────────────────
apt-get install -y docker-compose-plugin git

# ─── 4. Open firewall ports (ufw) ────────────────────────
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ─── 5. Clone the repository ─────────────────────────────
# Replace with your actual GitHub repo URL
REPO_URL="https://github.com/alexo123456780/ERP-WEB.git"
git clone "$REPO_URL" ~/erp-web

# ─── 6. Set up production .env ───────────────────────────
cp ~/erp-web/docker/.env.example ~/erp-web/docker/.env

# ─── 7. Verify installation ──────────────────────────────
docker --version
docker compose version

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit the .env file with your production values:"
echo "     nano ~/erp-web/docker/.env"
echo ""
echo "  2. First-time manual deploy:"
echo "     docker compose -f ~/erp-web/docker/docker-compose.prod.yml up -d"
