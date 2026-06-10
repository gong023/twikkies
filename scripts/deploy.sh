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
npm run migrate

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
