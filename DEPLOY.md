# Cara Deploy

## Ringkasnya

```
Netlify  → website portal (gratis)
Railway  → database + login admin (gratis)
```

---

## 1. Deploy ke Railway (database + login)
![alt text](image.png)
1. Buka **railway.app** → login GitHub
2. **New Project** → pilih repo GitHub kamu
3. Klik **+ New** → **PostgreSQL**
4. Klik service API → tab **Variables**, isi:

| Variable | Value |
|---|---|
| `DATABASE_URL` | (klik Copy dari PostgreSQL) |
| `JWT_SECRET` | (klik Generate) |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |
| `ADMIN_USER` | `smanfourtte26@gmail.com` (default — boleh dikosongkan) |
| `ADMIN_PASS` | `smanfour#4` (default — boleh dikosongkan) |
| `ALLOWED_ORIGINS` | https://namamu.netlify.app |

5. Klik service API → **Settings** → **Networking** → **Generate Domain**
6. Copy URL-nya (contoh: `https://api-xxx.railway.app`)

---

## 2. Deploy ke Netlify (website)

1. Buka **app.netlify.com** → login GitHub
2. **Add new site** → import repo kamu
3. Isi:

| Setting | Value |
|---|---|
| Build command | `node scripts/build-config.mjs` |
| Publish directory | `.` |

4. Edit `netlify.toml` di repo → ganti URL Railway:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://URL-RAILWAY-KAMU/api/:splat"
  status = 200
  force = true
```

5. Push → otomatis deploy

---

## 3. Login

Buka website Netlify → klik **Masuk**:
- Username: `admin`
- Password: (yang kamu buat di Railway)

16 mapel Kelas X sudah otomatis terisi.

---

## Kelola LMS

Setelah login admin, klik **Kelola** untuk:
- **Tambah** LMS baru (tempel tautan Netlify dari guru)
- **Ubah** nama, guru, tautan, warna
- **Hapus** LMS yang tidak dipakai

Semua tersimpan di database Railway.
