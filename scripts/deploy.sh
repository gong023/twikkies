#!/usr/bin/env bash
# Re-deploy twikkies: pull latest, rebuild, restart service
set -euo pipefail

PROJ="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Pulling latest code..."
cd "$PROJ"
git pull

echo "==> Installing backend dependencies..."
cd "$PROJ/backend"
npm ci

echo "==> Building backend..."
npm run build

echo "==> Running migrations..."
DATABASE_URL=$(grep '^DATABASE_URL=' "$PROJ/backend/.env" | sed 's/^DATABASE_URL=//' | sed 's/[?&]uselibpqcompat=[^&]*//')
for f in "$PROJ"/backend/src/db/migrations/*.sql; do
  psql "$DATABASE_URL" -f "$f"
done

echo "==> Installing frontend dependencies..."
cd "$PROJ/frontend"
npm ci

echo "==> Building frontend..."
npm run build

echo "==> Restarting service..."
sudo systemctl restart twikkies-server

echo ""
echo "==> Status:"
sudo systemctl status twikkies-server --no-pager -l | tail -8

echo ""
echo "==> Done."
