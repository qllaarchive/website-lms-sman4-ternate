# Cara Deploy

## Ringkasnya

```
Netlify / Vercel → website portal (gratis selamanya)
Neon             → database PostgreSQL (gratis selamanya, 0,5–1 GB)
Render           → backend API (gratis selamanya, 750 jam/bln)
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

## 3. Netlify / Vercel (website portal)

Konfigurasi di repo sudah siap (`netlify.toml` + `vercel.json`) — tinggal ganti 1 URL.

1. Import repo ke **app.netlify.com** (via `netlify.toml`) **atau** **vercel.com** (via `vercel.json`)
2. Ganti URL API didalam file config itu dengan URL Render:

```toml
# netlify.toml
[[redirects]]
  from = "/api/*"
  to = "https://lms-api.onrender.com/api/:splat"
  status = 200
  force = true
```

```json
// vercel.json
"rewrites": [
  { "source": "/api/:path*", "destination": "https://lms-api.onrender.com/api/:path*" }
]
```

3. Push → otomatis deploy → salin URL portal (mis. `https://lms.netlify.app`)
4. Kembali ke **Render** → pilih API → Settings → Environment → tab `ALLOWED_ORIGINS` →
   isi URL portal: `https://lms.netlify.app` → Save → API restart otomatis

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
