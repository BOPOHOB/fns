#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-bopohob.ru}"
USER="${DEPLOY_USER:-bopohob}"
REMOTE="${USER}@${HOST}"
REMOTE_DIR="${DEPLOY_DIR:-/var/www/feelandswim}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  echo "Missing .env (YANDEX_CLIENT_ID / YANDEX_CLIENT_SECRET). Aborting." >&2
  exit 1
fi

# shellcheck disable=SC1091
set -a
# trim leading spaces that may be in local .env
eval "$(sed -E 's/^[[:space:]]+//' .env | grep -E '^[A-Za-z_][A-Za-z0-9_]*=' || true)"
set +a

: "${YANDEX_CLIENT_ID:?YANDEX_CLIENT_ID missing in .env}"
: "${YANDEX_CLIENT_SECRET:?YANDEX_CLIENT_SECRET missing in .env}"

echo "==> Building frontend…"
npx vite build

echo "==> Preparing remote directories…"
ssh "$REMOTE" "mkdir -p ${REMOTE_DIR}/dist ${REMOTE_DIR}/src"

echo "==> Uploading to ${REMOTE}:${REMOTE_DIR}…"
rsync -az --delete dist/ "${REMOTE}:${REMOTE_DIR}/dist/"
rsync -az --delete src/backend/ "${REMOTE}:${REMOTE_DIR}/src/backend/"
rsync -az --delete src/types/ "${REMOTE}:${REMOTE_DIR}/src/types/"
rsync -az --delete src/shared/ "${REMOTE}:${REMOTE_DIR}/src/shared/"
rsync -az --delete src/sql/ "${REMOTE}:${REMOTE_DIR}/src/sql/"
scp deno.json deno.lock feelandswim.service feelAndSwim.ru "${REMOTE}:${REMOTE_DIR}/"

# Production env on the server (do not commit)
ssh "$REMOTE" "cat > ${REMOTE_DIR}/.env" <<EOF
YANDEX_CLIENT_ID=${YANDEX_CLIENT_ID}
YANDEX_CLIENT_SECRET=${YANDEX_CLIENT_SECRET}
FRONTEND_ORIGIN=https://feelandswim.ru
OAUTH_REDIRECT_URI=https://feelandswim.ru/auth/callback
COOKIE_SECURE=true
HOST=127.0.0.1
PORT=8787
DB_PATH=${REMOTE_DIR}/data.db
EOF
ssh "$REMOTE" "chmod 600 ${REMOTE_DIR}/.env"

# Seed DB once: local data.db if present, otherwise empty schema
if ! ssh "$REMOTE" "test -f ${REMOTE_DIR}/data.db"; then
  LOCAL_DB="${ROOT}/data.db"
  if [[ -f "$LOCAL_DB" ]]; then
    echo "==> Uploading initial data.db…"
    scp "$LOCAL_DB" "${REMOTE}:${REMOTE_DIR}/data.db"
  else
    echo "==> Initializing empty SQLite schema…"
    ssh "$REMOTE" bash -s <<EOF
set -euo pipefail
cd ${REMOTE_DIR}
DB=${REMOTE_DIR}/data.db
for f in src/sql/swimmer.sql src/sql/team.sql src/sql/swimmer_team.sql src/sql/result_series.sql src/sql/result.sql; do
  sqlite3 "\$DB" < "\$f"
done
EOF
  fi
fi

echo "==> Installing service, switching from fns, reloading nginx…"
ssh "$REMOTE" bash -s <<EOF
set -euo pipefail
export PATH="\$HOME/.deno/bin:\$PATH"
command -v deno >/dev/null || { echo "Deno not found in PATH"; exit 1; }

sudo cp ${REMOTE_DIR}/feelandswim.service /etc/systemd/system/feelandswim.service
sudo cp ${REMOTE_DIR}/feelAndSwim.ru /etc/nginx/sites-enabled/feelAndSwim.ru

sudo systemctl daemon-reload
sudo systemctl stop fns.service 2>/dev/null || true
sudo systemctl disable fns.service 2>/dev/null || true
sudo systemctl enable feelandswim.service
sudo systemctl restart feelandswim.service
sudo nginx -t
sudo systemctl reload nginx

sleep 1
curl -fsS http://127.0.0.1:8787/api/health
echo
systemctl is-active feelandswim.service
EOF

echo "==> Done. Site: https://feelandswim.ru"
echo "    Check Yandex OAuth Redirect URI: https://feelandswim.ru/auth/callback"
