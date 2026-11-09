#!/usr/bin/env bash
# LMS SMA Negeri 4 Ternate — server-side deployment (Ubuntu + VirtualBox).
# Run on the server after copying the project (rsync).
#
# Usage (from within the server after rsync):
#   sudo bash deploy-ubuntu.sh [ADMIN_USER] [ADMIN_PASS]
#
# If omitted, ADMIN_USER/ADMIN_PASS are prompted interactively.

set -euo pipefail

APP_DIR="/opt/lms"
API_DIR="$APP_DIR/api"

info()  { echo "[INFO]  $*"; }
warn()  { echo "[WARN]  $*"; }
error() { echo "[ERROR] $*" >&2; exit 1; }

# --- pilihan admin: biarkan atau baca dari env / prompt ---
ADMIN_USER="${1:-${ADMIN_USER:-}}"
ADMIN_PASS="${2:-${ADMIN_PASS:-}}"

if [ -z "$ADMIN_USER" ] || [ -z "$ADMIN_PASS" ]; then
  info "Konfigurasi akun admin (wajib)."
  if [ -z "$ADMIN_USER" ]; then
    read -r -p "  Username admin (email): " ADMIN_USER
  fi
  if [ -z "$ADMIN_PASS" ]; then
    stty -echo
    read -r -p "  Password admin (min. 12 karakter): " ADMIN_PASS
    stty echo
    echo
  fi
  if [ "${#ADMIN_PASS}" -lt 12 ]; then
    error "Password terlalu pendek. Minimal 12 karakter."
  fi
fi

if [ ! -f "$API_DIR/package.json" ]; then
  error "Repo tidak ditemukan di $API_DIR — jsalin dulu dengan rsync."
fi

# --- Node.js 20 (NodeSource) ---
if ! command -v node &>/dev/null; then
  info "Menginstal Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - >/dev/null
  sudo apt-get install -y nodejs
fi
node --version

# --- Sistem dasar: PostgreSQL, Nginx, firewall ---
info "Memperbarui package & menginstal PostgreSQL + Nginx + firewall..."
sudo apt-get update -y
sudo apt-get install -y postgresql nginx ca-certificates
sudo systemctl enable --now postgresql

# --- Database: buat role + database (hanya jika belum ada) ---
DB_PASS=$(openssl rand -hex 16)
DB_URL="postgresql://lms:$DB_PASS@127.0.0.1:5432/lms"

sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'lms') THEN
    CREATE ROLE lms LOGIN PASSWORD '$DB_PASS';
  ELSE
    ALTER ROLE lms WITH PASSWORD '$DB_PASS';
  END IF;
END
\$\$;
SQL

if ! sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='lms'" | grep -q 1; then
  sudo -u postgres createdb -O lms lms
fi

# --- Environment file (create hanya, jangan tulis ulang jika sudah ada) ---
if [ ! -f "$API_DIR/.env" ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  cat > "$API_DIR/.env" <<ENV
DATABASE_URL=postgresql://lms:$DB_PASS@127.0.0.1:5432/lms
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=3000
ADMIN_USER=$ADMIN_USER
ADMIN_PASS=$ADMIN_PASS
ALLOWED_ORIGINS=

ENV
  chmod 600 "$API_DIR/.env"
  chown -R lms:lms "$API_DIR"
  info "File .env dibuat. Rahasia ada di $API_DIR/.env (mode 600)."
else
  warn ".env sudah ada — biarkan utuh atau hapus dulu bila ingin di-generate ulang."
fi

# --- Prisma: generate client, migrate, seed ---
cd "$API_DIR"
info "Menginstal node_modules & build Prisma..."
rm -rf node_modules
sudo -u lms npm ci --include=dev
sudo -u lms npx prisma generate
sudo -u lms npx prisma migrate deploy

# Seed (cukup sekali — password admin sudah di .env)
sudo -u lms env ADMIN_USER="$ADMIN_USER" ADMIN_PASS="$ADMIN_PASS" npm run seed

# --- Systemd service ---
if systemctl list-unit-files | grep -q "^lms-api\.service"; then
  sudo systemctl daemon-reload
else
  sudo tee /etc/systemd/system/lms-api.service >/dev/null <<UNIT
[Unit]
Description=LMS API (Express :3000)
After=network.target postgresql.service
Wants=network.target postgresql.service

[Service]
Type=simple
User=lms
WorkingDirectory=$API_DIR
EnvironmentFile=$API_DIR/.env
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
UNIT
  sudo systemctl daemon-reload
fi

sudo systemctl enable --now lms-api
sudo systemctl status lms-api --no-pager | head -6

# --- Nginx: portal + proxy /api ---
if [ -f /etc/nginx/sites-available/lms ]; then
  sudo rm -f /etc/nginx/sites-enabled/lms
fi
sudo tee /etc/nginx/sites-available/lms >/dev/null <<'NGINX'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root /opt/lms/public;
  index index.html;

  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

  location /mapel/ {
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    try_files $uri =404;
  }

  location / {
    try_files $uri $uri/ =404;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/lms
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# --- Firewall ---
if command -v ufw &>/dev/null && ! sudo ufw status | grep -q "Status: active"; then
  sudo ufw allow OpenSSH
  sudo ufw allow 80/tcp
  sudo ufw --force enable
fi

# --- Cek kesehatan ---
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1; then
  info "Server siap."
  echo
  echo "  Portal : http://$(curl -fsS --max-time 4 ifconfig.me 2>/dev/null || echo '<IP-VM>')"
  echo "  API    : http://127.0.0.1:3000"
  echo "  Login  : $ADMIN_USER  (sandi di .env)"
  echo
  echo "  Rahasia tersimpan di $API_DIR/.env (mode 600). Simpan salinan di tempat aman."
else
  error "API belum respons — cek: sudo journalctl -u lms-api -n 50"
fi
