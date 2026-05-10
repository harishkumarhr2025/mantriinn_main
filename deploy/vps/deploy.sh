#!/usr/bin/env bash
set -euo pipefail

RELEASE_ID="${1:?release id required}"
FRONTEND_TGZ="${2:?frontend archive required}"
BACKEND_TGZ="${3:?backend archive required}"

BASE="/var/www/salon-app"
FRONT_BASE="$BASE/frontend"
BACK_BASE="$BASE/backend"
SHARED="$BASE/shared"
LOG_FILE="/var/log/salon-app/deploy.log"

FRONT_RELEASE="$FRONT_BASE/releases/$RELEASE_ID"
BACK_RELEASE="$BACK_BASE/releases/$RELEASE_ID"

mkdir -p "$FRONT_RELEASE" "$BACK_RELEASE"

echo "$(date -Iseconds) Starting deploy $RELEASE_ID" >> "$LOG_FILE"

# Frontend deploy (atomic symlink)
tar -xzf "$FRONTEND_TGZ" -C "$FRONT_RELEASE"
ln -sfn "$FRONT_RELEASE" "$FRONT_BASE/current"

# Backend deploy (install prod deps in release)
tar -xzf "$BACKEND_TGZ" -C "$BACK_RELEASE"
ln -sfn "$SHARED/.env.backend" "$BACK_RELEASE/.env"

cd "$BACK_RELEASE"
npm ci --omit=dev

ln -sfn "$BACK_RELEASE" "$BACK_BASE/current"

# Zero/near-zero downtime backend reload
if pm2 describe mantriinn-backend >/dev/null 2>&1; then
  pm2 reload "$SHARED/ecosystem.config.cjs" --only mantriinn-backend --update-env
else
  pm2 start "$SHARED/ecosystem.config.cjs" --only mantriinn-backend
fi
pm2 save

rm -f "$FRONTEND_TGZ" "$BACKEND_TGZ"

# Keep last 5 releases
ls -1dt "$FRONT_BASE"/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf
ls -1dt "$BACK_BASE"/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf

echo "$(date -Iseconds) Deploy success $RELEASE_ID" >> "$LOG_FILE"
