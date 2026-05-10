#!/usr/bin/env bash
set -euo pipefail

RELEASE_ID="${1:?release id required}"

BASE="/var/www/salon-app"
FRONT_BASE="$BASE/frontend"
BACK_BASE="$BASE/backend"
SHARED="$BASE/shared"

FRONT_TARGET="$FRONT_BASE/releases/$RELEASE_ID"
BACK_TARGET="$BACK_BASE/releases/$RELEASE_ID"

if [[ ! -d "$FRONT_TARGET" || ! -d "$BACK_TARGET" ]]; then
  echo "Release not found: $RELEASE_ID"
  exit 1
fi

ln -sfn "$FRONT_TARGET" "$FRONT_BASE/current"
ln -sfn "$BACK_TARGET" "$BACK_BASE/current"

pm2 reload "$SHARED/ecosystem.config.cjs" --only mantriinn-backend --update-env
pm2 save

echo "Rollback completed to $RELEASE_ID"
