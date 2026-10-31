# Cara Deploy

## Ringkasnya

**Backend (API + database) wajib ikut dideploy di semua opsi** — tanpa backend,
portal hanya mode baca dengan data bawaan: login admin, kelola LMS, dan profil
sekolah tidak berfungsi.

```
Netlify / Vercel / GitHub Pages → website portal (statis)
Neon                            → database PostgreSQL (wajib — pusat data)
Render                          → backend API (wajib — login & kelola LMS)
```

> Semua tanpa kartu kredit. Batasnya jauh di atas kebutuhan sekolah.
> Catatan: API di Render tidur setelah 15 menit kosong — pengunjung pertama
> menunggu ±30–60 detik, selanjutnya kencang. (Lihat tips di bawah.)

---

## 1. Neon (database PostgreSQL)

1. Buka **neon.tech** → login GitHub → **Create project** (region terdekat: `Singapore`)
2. Setelah jadi, dashboard → **Connection Details** → salin connection string:

```
postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

3. Simpan string itu — dipakai di langkah Render.

---

## 2. Render (backend API)

1. Buka **render.com** → login GitHub → **New** → **Web Service** → pilih repo Git kamu
2. Isi konfigurasi:

| Setting | Value |
|---|---|
| Root Directory | `api` |
| Runtime | Node |
| Build Command | `npm ci && npx prisma generate` |
| Start Command | `npx prisma migrate deploy && node prisma/seed.js && node src/index.js` |
| Instance Type | Free |

3. Tab **Environment** → tambahkan:

| Variable | Value |
|---|---|
| `DATABASE_URL` | (connection string dari Neon, langkah 1) |
| `JWT_SECRET` | (teks acak panjang, boleh generate dari password manager) |
| `NODE_ENV` | `production` |
| `ADMIN_USER` | email admin sekolah (dipakai login di website) |
| `ADMIN_PASS` | kata sandi admin — **WAJIB diganti, jangan default!** |
| `ALLOWED_ORIGINS` | (isi setelah website portal jadi — lihat langkah 3) |

4. Klik **Create Web Service** → tunggu deploy pertama
5. Salin URL yang muncul (contoh: `https://lms-api.onrender.com`) — setiap deploy otomatis diberi halaman `/health` untuk cek hidup.

---

## 3. Portal — Netlify / Vercel / GitHub Pages

Semua jalur di bawah memanggil API yang dideploy di langkah 2 — backend wajib hidup.

### Jalur A — Netlify (`netlify.toml`)

1. Import repo ke **app.netlify.com**
2. Ganti URL API di `netlify.toml` dengan URL Render:

```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://lms-api.onrender.com/api/:splat"
  status = 200
  force = true
```

3. Push → otomatis deploy → salin URL portal (mis. `https://lms.netlify.app`)

### Jalur B — Vercel (`vercel.json`)

1. Import repo ke **vercel.com**
2. Ganti URL API di `vercel.json`:

```json
// vercel.json
"rewrites": [
  { "source": "/api/:path*", "destination": "https://lms-api.onrender.com/api/:path*" }
]
```

3. Push → otomatis deploy → salin URL portal

### Jalur C — GitHub Pages

GitHub Pages **tidak bisa** memproksi `/api/*` (statis), jadi portal memanggil
API langsung lintas-origin. Portal mengirim session dalam bentuk
`Authorization: Bearer` (setelah login, API mengembalikan token — lihat
`assets/api-client.js`), jadi masalah cookie pihak ketiga tak berpengaruh:

1. Buat workflow Pages (mis. `.github/workflows/pages.yml`) yang menjalankan:

   ```yaml
   # sebelum upload artifact:
   - run: node scripts/build-config.mjs
     env:
       LMS_API_BASE: https://LMS-API-ANDA.onrender.com/api
   # lalu upload seluruh repo sebagai artifact Pages
   ```

2. Aktifkan **Settings → Pages → Source: GitHub Actions**
3. Kembali ke **Render** → `ALLOWED_ORIGINS` → isi `https://<username>.github.io`
   (wajib — tanpa itu portal lintas origin diblokir CORS saat login)

> Perlindungan samakan dengan jalur lain: `NODE_ENV=production` memastikan
> cookie/token diberi flag Secure, dan `JWT_SECRET` acak wajib.

### Jalur D — VPS + Nginx (punya sendiri)

Panduan lengkap Ubuntu server (gratis via Oracle Cloud Free Tier juga dibahas):
**`docs/deploy-vps.md`** — provisioning otomatis lewat `scripts/setup-ubuntu.sh`.
`portal-nginx.conf` dipakai jika memilih jalur docker-compose di VPS.

---

## 4. Hubungkan: `ALLOWED_ORIGINS`

Kembali ke **Render** → pilih API → Settings → Environment → `ALLOWED_ORIGINS`:
isi URL portal final (contoh: `https://lms.netlify.app`) → Save → API restart
otomatis. Langkah ini **wajib** — tanpa itu, portal GitHub Pages/Netlify akan
diblokir CORS saat login.

---

## 4. Coba masuk

1. Buka website portal → tombol **Masuk**
2. Username = `ADMIN_USER`, password = `ADMIN_PASS`
3. Selesai — klik **Kelola** untuk tambah/ubah/hapus LMS

## Tips praktis (opsional)

- **Agar API tidak tidur** — daftar [UptimeRobot](https://uptimerobot.com) (gratis):
  buat monitor HTTP ke `https://URL-RENDER/health` tiap 5 menit. API selalu hangat,
  pengunjung tidak pernah kena delay bangun.
- **Pantau ukuran data** — cek dashboard Neon (batas 0,5 GB; skala gratis sesungguhnya
  masih longgar). Kalau benar-benar melebihi, upgrade ke paket Neon berbayar.

---

## Alternatif: Railway (semua dalam satu tempat — berbayar)

Jika tidak suka 3-platform terpisah, Railway menggabungkan API + PostgreSQL
dalam 1 dashboard (mulai ~$5/bulan, hanya trial credit gratis):

1. **railway.app** → New Project → deploy repo + tambah **PostgreSQL**
2. Variables API: `DATABASE_URL` (copy dari PostgreSQL), `JWT_SECRET`, `PORT=3000`,
   `NODE_ENV=production`, `ADMIN_USER`/`ADMIN_PASS`, `ALLOWED_ORIGINS`
3. Settings → Networking → **Generate Domain** → URL ini dipakai di netlify/vercel
4. Lihat bagian "Coba masuk" di atas — sama saja
