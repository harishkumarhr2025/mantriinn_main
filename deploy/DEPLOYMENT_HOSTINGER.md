# MantrInn Production Deployment (Hostinger VPS)

This guide is for this repository structure:
- Frontend: `admin`
- Backend: `Backend`

Deployment model:
- GitHub Actions builds frontend + packages backend
- Artifacts are uploaded to VPS over SSH
- VPS creates atomic release folders and updates `current` symlinks
- PM2 reloads backend process
- NGINX serves React build and proxies `/api/` to backend

## 1) Recommended VPS structure

```text
/var/www/salon-app/
  frontend/
    releases/
    current -> releases/<timestamp>
  backend/
    releases/
    current -> releases/<timestamp>
  shared/
    .env.backend
    ecosystem.config.cjs
  scripts/
    deploy.sh
    rollback.sh
/var/log/salon-app/
  deploy.log
  backend-out.log
  backend-error.log
```

## 2) VPS setup commands (run as root)

```bash
bash deploy/vps/bootstrap_commands.sh
```

Or run manually:

```bash
apt update && apt upgrade -y
apt install -y nginx ufw fail2ban curl git unzip build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
mkdir -p /var/www/salon-app/{frontend/releases,backend/releases,shared,scripts}
mkdir -p /var/log/salon-app
```

## 3) Create deploy user and permissions

If not already done:

```bash
adduser deploy
usermod -aG sudo deploy
usermod -aG www-data deploy
chown -R deploy:deploy /var/www/salon-app
chown -R deploy:deploy /var/log/salon-app
chmod -R 755 /var/www/salon-app
```

Optional limited sudo for nginx reload:

```bash
echo 'deploy ALL=(ALL) NOPASSWD:/usr/sbin/nginx,/bin/systemctl reload nginx,/bin/systemctl restart nginx,/bin/systemctl status nginx' > /etc/sudoers.d/deploy-limited
visudo -cf /etc/sudoers.d/deploy-limited
```

## 4) SSH key authentication for GitHub Actions

On your local machine:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./github_actions_deploy_key
```

On VPS (as `deploy`):

```bash
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
cat >> /home/deploy/.ssh/authorized_keys
# paste github_actions_deploy_key.pub content, then Ctrl+D
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

Test:

```bash
ssh -i ./github_actions_deploy_key deploy@YOUR_VPS_IP
```

## 5) Copy deploy files to VPS

From your machine after pulling latest repo:

```bash
scp -i ./github_actions_deploy_key deploy/vps/deploy.sh deploy@YOUR_VPS_IP:/var/www/salon-app/scripts/deploy.sh
scp -i ./github_actions_deploy_key deploy/vps/rollback.sh deploy@YOUR_VPS_IP:/var/www/salon-app/scripts/rollback.sh
scp -i ./github_actions_deploy_key deploy/vps/ecosystem.config.cjs deploy@YOUR_VPS_IP:/var/www/salon-app/shared/ecosystem.config.cjs
```

On VPS:

```bash
chmod +x /var/www/salon-app/scripts/deploy.sh
chmod +x /var/www/salon-app/scripts/rollback.sh
chown deploy:deploy /var/www/salon-app/scripts/deploy.sh
chown deploy:deploy /var/www/salon-app/scripts/rollback.sh
chown deploy:deploy /var/www/salon-app/shared/ecosystem.config.cjs
```

## 6) GitHub secrets (required)

Create these in GitHub:
- `VPS_HOST` (IP or domain)
- `VPS_PORT` (usually `22`)
- `VPS_USER` (`deploy`)
- `VPS_SSH_KEY` (private key from `github_actions_deploy_key`)
- `BACKEND_ENV_FILE` (full backend `.env` content)
- `FRONTEND_ENV_FILE` (full `admin/.env.production` content)

Example `FRONTEND_ENV_FILE`:

```env
REACT_APP_API_BASE_URL=https://YOUR_DOMAIN/api/v1
GENERATE_SOURCEMAP=false
```

Example backend env (minimum):

```env
NODE_ENV=production
PORT=8000
MONGO_URL_PROD=...
JWT_SECRET=...
```

## 7) NGINX production setup

Copy config template and replace domain:

```bash
cp deploy/nginx/mantriinn.conf /etc/nginx/sites-available/mantriinn.conf
# edit YOUR_DOMAIN placeholders
nano /etc/nginx/sites-available/mantriinn.conf
ln -s /etc/nginx/sites-available/mantriinn.conf /etc/nginx/sites-enabled/mantriinn.conf
nginx -t
systemctl reload nginx
```

## 8) DNS setup (GoDaddy)

Set:
- A record `@` -> `YOUR_VPS_IP`
- A record `www` -> `YOUR_VPS_IP`

Validate:

```bash
nslookup YOUR_DOMAIN
nslookup www.YOUR_DOMAIN
```

## 9) SSL with Certbot

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d YOUR_DOMAIN -d www.YOUR_DOMAIN --redirect -m YOUR_EMAIL --agree-tos --no-eff-email
certbot renew --dry-run
systemctl status certbot.timer
```

## 10) PM2 setup and startup on boot

As deploy user:

```bash
pm2 start /var/www/salon-app/shared/ecosystem.config.cjs --only mantriinn-backend
pm2 save
pm2 startup systemd -u deploy --hp /home/deploy
```

Run the generated command as root, then:

```bash
systemctl enable pm2-deploy
systemctl start pm2-deploy
```

## 11) GitHub Actions workflow

Workflow already added in this repo at:
- `.github/workflows/deploy.yml`

Behavior:
- Push to `master`/`main` triggers deploy
- Manual `workflow_dispatch` supports rollback input

## 12) Firewall/security baseline

```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
ufw status verbose
systemctl enable fail2ban
systemctl start fail2ban
```

Recommended SSH hardening in `/etc/ssh/sshd_config`:
- `PermitRootLogin no`
- `PasswordAuthentication no`

Then:

```bash
systemctl reload sshd
```

## 13) Rollback strategy

List releases:

```bash
ls -1 /var/www/salon-app/backend/releases
```

Rollback:

```bash
/var/www/salon-app/scripts/rollback.sh RELEASE_ID
systemctl reload nginx
```

From GitHub Actions UI:
- Run workflow manually
- Set `rollback_release` input

## 14) Zero/low downtime notes

- Frontend deploy uses atomic symlink swap.
- Backend deploy uses PM2 `reload` in cluster mode.
- Keep last 5 releases for quick fallback.

## 15) Logging and monitoring

```bash
pm2 status
pm2 monit
pm2 logs mantriinn-backend --lines 200
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
tail -f /var/log/salon-app/deploy.log
```

## 16) Safe restarts

```bash
pm2 reload mantriinn-backend --update-env
pm2 restart mantriinn-backend
nginx -t && systemctl reload nginx
pm2 save
```

## 17) Common troubleshooting

### GitHub Action fails
- Check exact failed step logs in Actions tab.
- Confirm all required secrets exist.
- Confirm deploy user can write to `/var/www/salon-app`.

### SSH/SCP fails
- Validate key and permissions under `/home/deploy/.ssh`.
- Test manual SSH with the same key.

### 502 from NGINX
- Backend not running or wrong port.
- Check `pm2 status` and `pm2 logs`.
- Ensure backend listens on `PORT=8000` and NGINX proxy uses 8000.

### SPA routes 404
- Ensure NGINX has: `try_files $uri $uri/ /index.html;`

### Deploy succeeds but old UI shows
- Browser cache/CDN cache issue.
- Hard refresh and verify `/var/www/salon-app/frontend/current/build` timestamp.

## 18) Build optimization recommendations

- Keep `GENERATE_SOURCEMAP=false` in frontend production env.
- Use `npm ci` in CI and in backend release installs.
- Keep static cache headers in NGINX for `/static/`.
- Consider `pm2-logrotate`:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 14
pm2 save
```

## 19) Optional future Docker migration path

Keep current non-Docker setup now.
Later migration path:
- Build frontend and backend Docker images in CI
- Push to GitHub Container Registry
- Pull + restart with docker compose on VPS

This can be done without changing your domain, DNS, or SSL strategy.
