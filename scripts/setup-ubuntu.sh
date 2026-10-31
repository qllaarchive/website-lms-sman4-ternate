#!/usr/bin/env bash
# LMS SMA Negeri 4 Ternate — provisioning Ubuntu native (tanpa Docker).
# Pemakaian (di server): sudo bash setup-ubuntu.sh
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Jalankan dengan: sudo bash $0" >&2
  exit 1
fi

APP_DIR="/opt/lms"
if [ ! -f "$APP_DIR/api/package.json" ]; then
  echo "Repo tidak ditemukan di $APP_DIR — unggah dulu: rsync -azv --exclude node_modules LMS/ SERVER:$APP_DIR/" >&2
  exit 1
fi
if [ -f "$APP_DIR/api/.env" ]; then
  echo "$APP_DIR/api/.env sudah ada — biarkan utuh atau hapus dulu bila ingin di-generate ulang." >&2
  exit 1
fi

NODE_MAJOR=$(node -v 2>/dev/null | sed 's/^v\([0-9]*\).*/\1/' || echo 0)
if [ "${NODE_MAJOR:-0}" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

apt-get update -y
apt-get install -y nginx postgresql git curl argon2 openssl build-essential python3

DB_PASS=$(openssl rand -hex 16)
JWT_SECRET=$(openssl rand -hex 32)

id -u lms &>/dev/null || useradd --system --create-home --shell /usr/sbin/nologin lms

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
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='lms'" | grep -q 1 \
  || sudo -u postgres createdb -O lms lms

if [ -z "${ADMIN_USER:-}" ]; then
  read -r -p "Email/username admin untuk login web: " ADMIN_USER
fi
if [ -z "${ADMIN_PASS:-}" ]; then
  read -r -s -p "Kata sandi admin (min. 12 karakter): " ADMIN_PASS
  echo
fi
if [ "${#ADMIN_PASS}" -lt 12 ]; then
  echo "Kata sandi admin terlalu pendek." >&2
  exit 1
fi

cat > "$APP_DIR/api/.env" <<ENV
DATABASE_URL=postgresql://lms:$DB_PASS@127.0.0.1:5432/lms
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=3000
ADMIN_USER=$ADMIN_USER
ADMIN_PASS=$ADMIN_PASS
ALLOWED_ORIGINS=
ENV
chmod 600 "$APP_DIR/api/.env"
chown lms:lms "$APP_DIR/api/.env"

chown -R lms:lms "$APP_DIR"
cd "$APP_DIR/api"
rm -rf node_modules
sudo -u lms npm ci --include=dev
sudo -u lms npx prisma generate
sudo -u lms npx prisma migrate deploy
sudo -u lms env ADMIN_USER="$ADMIN_USER" ADMIN_PASS="$ADMIN_PASS" node prisma/seed.js

cat > /etc/systemd/system/lms-api.service <<UNIT
[Unit]
Description=LMS API (Express :3000)
After=network-online.target postgresql.service
Wants=network-online.target
Requires=postgresql.service

[Service]
User=lms
WorkingDirectory=$APP_DIR/api
EnvironmentFile=$APP_DIR/api/.env
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now lms-api.service

cat > /etc/nginx/sites-available/lms <<NGINX
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root $APP_DIR;
  index index.html;

  add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  location /mapel/ {
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    try_files \$uri =404;
  }

  location / { try_files \$uri \$uri/ =404; }

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host \$host;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 30s;
  }
}
NGINX
ln -sf /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/lms
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if command -v ufw >/dev/null; then
  ufw allow OpenSSH
  ufw allow 80/tcp
fi

for i in $(seq 1 20); do
  curl -fsS http://127.0.0.1:3000/health >/dev/null 2>&1 && break
  sleep 1
done
curl -fsS http://127.0.0.1:3000/health >/dev/null \
  && echo "API sehat" || { echo "API belum respons — cek: journalctl -u lms-api -n 50"; exit 1; }

IP=$(curl -fsS --max-time 4 ifconfig.me 2>/dev/null || echo "IP-SERVER")
echo
echo "Deploy selesai →  http://$IP"
echo "Login: $ADMIN_USER  (sandi yang kamu pilih tadi)"
echo "Rahasia tersimpan di $APP_DIR/api/.env (mode 600). Simpan salinan di tempat aman."
