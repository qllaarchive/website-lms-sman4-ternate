# LMS SMA Negeri 4 Ternate — Deployment Guide (Ubuntu + VirtualBox)

> Deploy `desktop/LMS/` ke Ubuntu Server yang dijalankan di VirtualBox.
> **Tidak mengubah file proyek** — semua file deployment dibuat di sini dan di server baru.

---

## Arsitektur yang Dilayani

```
User Browser
     │
     ▼
VirtualBox (Ubuntu Server)
  ├── Nginx       ← port 80 → static portal (public/) + proxy /api/ → API
  ├── Node.js     ← port 3000 → Express API (systemd service)
  └── PostgreSQL  ← database
```

- **Portal** (`public/`) → Nginx mengirim file statis langsung.
- **API** (`api/`) → Node.js + Express, dijalankan sebagai service systemd.
- **Database** → PostgreSQL, database `lms`.
- `/api/*` dari portal diteruskan (proxy) ke API.

---

## Persyaratan Hardware (VirtualBox)

| Komponen | Rekomendasi | Minimum |
|---|---|---|
| RAM | 4 GB | 2 GB |
| CPU | 2 core | 1 core |
| Disk | 30 GB | 20 GB |

---

## Bagian 1 — Buat Virtual Machine Ubuntu (VirtualBox)

### 1.1 Download Ubuntu Server

1. Buka https://ubuntu.com/download/server
2. Download **Ubuntu Server 24.04 LTS** (atau 22.04 LTS)
3. Simpan file `.iso` (contoh: `ubuntu-24.04.3-live-server-amd64.iso`)

### 1.2 Buat VM di VirtualBox

Buka **VirtualBox** → **New**:

| Setting | Nilai |
|---|---|
| Name | `lms-ubuntu` |
| Machine folder | default (`/Users/mac/VirtualBox VMs/`) |
| Type | Linux |
| Version | **Ubuntu (64-bit)** |
| RAM | 4096 MB (4 GB) |
| CPU | 2 (dipilih 2 Core) |
| Hard disk | 30 GB (VDI, Dynamically allocated) |

Setelah VM dibuat:
1. Klik VM → **Settings** → **Storage**
2. Di **Empty** (CD/DVD), klik disk icon kiri → **Choose a disk file**
3. Pilih file `ubuntu-24.04.3-live-server-amd64.iso`
4. **Settings** → **Network** → **Attached to: Bridged Adapter** (sesuaikan dengan adapter WiFi/Ethernet yang menyala)
5. Klik **Start** → ikuti instalasi Ubuntu Server (pilih **SSH server** saat questions)
6. Setelah instalasi selesai, catat **IP address** VM

### 1.3 Buka port 80 (jika perlu)

Di VirtualBox → VM → **Settings** → **Network** → **Advanced** → **Port Forwarding** (jika menggunakan NAT):

| Name | Protocol | Host Port | Guest Port |
|---|---|---|---|
| http | TCP | 80 | 80 |
| https | TCP | 443 | 443 |

Atau gunakan **Bridged Adapter** yang secara otomatis membuat VM punya IP publik di jaringan lokal.

---

## Bagian 2 — Deploy Kode & Konfigurasi Server

### 2.1 Koneksi ke Server

```bash
ssh ubuntu@<IP-VM>
# atau (jika menggunakan key)
ssh -i /path/to/key ubuntu@<IP-VM>
```

### 2.2 Siapkan direktori

```bash
# pastikan ownership (hindari sudo di direktori proyek)
sudo mkdir -p /opt/lms
sudo chown -R ubuntu:ubuntu /opt/lms
```

### 2.3 Salin kode proyek (hanya read, tidak mengubah file asli)

Dari **komputer lokal** (bukan dari server):

```bash
cd desktop/LMS
rsync -azv --exclude node_modules --exclude .git \
  ./ ubuntu@<IP-VM>:/opt/lms/ -e "ssh -i /path/to/kunci.pem"
```

> Tips: gunakan SSH key, bukan password. Buat key dulu: `ssh-keygen -t ed25519 -f ~/.ssh/lms-key`

### 2.4 Instal dependensi & set up database

Login ke server, lalu:

```bash
cd /opt/lms

# Install Node.js 20 (apt default mungkin versi lebih lama)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL & Nginx
sudo apt-get update -y
sudo apt-get install -y postgresql nginx ca-certificates

# Buat database & user (bijak: ganti PASS di bawah)
sudo -u postgres psql -c "CREATE ROLE lms LOGIN PASSWORD 'GANTI_SALIN_ANDA';"
sudo -u postgres psql -c "CREATE DATABASE lms OWNER lms;"
```

### 2.5 Setup environment & migrasi

```bash
cd /opt/lms/api

# Generate JWT secret (random 32 bytes)
export JWT_SECRET=$(openssl rand -hex 32)

# Isi .env (hanya file baru, tidak mengubah source code)
cat > .env <<'ENV'
DATABASE_URL=postgresql://lms:GANTI_SALIN_ANDA@127.0.0.1:5432/lms
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=3000
ADMIN_USER=admin
ADMIN_PASS=BuatSandiKuatMinimal12Karakter
ALLOWED_ORIGINS=
ENV

chmod 600 .env
chown -R lms:lms /opt/lms

# Install node_modules & build
sudo -u lms npm ci --include=dev
sudo -u lms npx prisma generate
sudo -u lms npx prisma migrate deploy
sudo -u lms npm run seed
```

> **Catatan:** Ganti:
> - `GANTI_SALIN_ANDA` – password database
> - `BuatSandiKuatMinimal12Karakter` – password admin web

### 2.6 Jalankan API sebagai service systemd

```bash
sudo tee /etc/systemd/system/lms-api.service > /dev/null <<'UNIT'
[Unit]
Description=LMS API (Express :3000)
After=network.target postgresql.service
Wants=network.target postgresql.service

[Service]
Type=simple
User=lms
WorkingDirectory=/opt/lms/api
EnvironmentFile=/opt/lms/api/.env
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
sudo systemctl enable --now lms-api
```

### 2.7 Konfigurasi Nginx (portal + proxy /api)

```bash
sudo tee /etc/nginx/sites-available/lms > /dev/null <<'NGINX'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name _;
  root /opt/lms/public;
  index index.html;

  # Header keamanan
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

  # Halaman mapel (JS inline → perlu unsafe-inline)
  location /mapel/ {
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    try_files $uri =404;
  }

  location / {
    try_files $uri $uri/ =404;
  }

  # API (proxy ke lokasi API)
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
```

### 2.8 Buka port & verifikasi

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw --force enable

# Cek
curl http://<IP-VM>/health          # → {"ok":true}
curl http://<IP-VM>                  # → halaman portal
```

---

## Bagian 3 — Akses & Verifikasi

| Tujuan | URL |
|---|---|
| Portal utama | `http://<IP-VM>` |
| API health | `http://<IP-VM>/health` |
| Login admin | tombol **Masuk** di portal |

**Login admin:** gunakan `ADMIN_USER` dan `ADMIN_PASS` dari langkah 2.5.

---

## Perbarui Kode (setelah ubah di `desktop/LMS/`)

```bash
# 1. Salin ulang (hanya read, expected update)
rsync -azv --exclude node_modules --exclude .git \
  ./ ubuntu@<IP-VM>:/opt/lms/ -e "ssh -i /path/to/kunci.pem"

# 2. Restart API (satu perintah)
ssh ubuntu@<IP-VM> "
  cd /opt/lms/api
  sudo systemctl restart lms-api
"
```

> **Catatan:** 
> - File statis (`public/`) — cukup refresh browser.
> - Kode backend (`api/`) — setelah rsync, restart servis.
> - Schema Prisma: `sudo -u lms npx prisma migrate deploy`

---

## Troubleshooting

| Gejala | Solusi |
|---|---|
| Website tidak bisa dibuka | `curl -v http://<IP-VM>` cek NAT port forward; pastikan VM running |
| `502 Bad Gateway` | `sudo systemctl status lms-api` → cek apakah API hidup |
| Login gagal | Pastikan `ADMIN_USER` & `ADMIN_PASS` sesuai, `NODE_ENV=production` |
| `Failed to fetch` / CORS | Isi `ALLOWED_ORIGINS` (URL portal, tidak termasuk port) di `.env` |
| Database 500 error | `sudo systemctl status postgresql` → periksa `DATABASE_URL` |
| API tidur | Nginx `proxy_read_timeout 30s` — cukup, tetapi jika request lambat, naikkan |

---

## Opsional — Domain + HTTPS

1. Beli domain → arahkan A record ke IP VM
2. Edit `/etc/nginx/sites-available/lms`, ganti `server_name _` menjadi `server_name lms.sekolah.id;`
3. Pasang sertifikat:
   ```bash
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d lms.sekolah.id
   ```
4. Buka port 443 di VirtualBox Network → Port Forwarding (jika NAT)
