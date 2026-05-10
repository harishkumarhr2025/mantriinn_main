#!/usr/bin/env bash
set -euo pipefail

# Run this as root on a fresh Ubuntu VPS.
apt update && apt upgrade -y
apt install -y nginx ufw fail2ban curl git unzip build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

mkdir -p /var/www/mantri_inn/{frontend/releases,backend/releases,shared,scripts}
mkdir -p /var/log/mantri_inn

# Create deploy user if missing.
if ! id -u deploy >/dev/null 2>&1; then
  adduser --disabled-password --gecos "" deploy
  usermod -aG sudo deploy
  usermod -aG www-data deploy
fi

chown -R deploy:deploy /var/www/mantri_inn
chown -R deploy:deploy /var/log/mantri_inn
chmod -R 755 /var/www/mantri_inn

# Firewall baseline.
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

systemctl enable nginx
systemctl start nginx
systemctl enable fail2ban
systemctl start fail2ban

echo "Bootstrap complete."
