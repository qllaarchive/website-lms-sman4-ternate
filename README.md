# LMS SMA Negeri 4 Ternate

[![CI](https://github.com/qllaarchive/website-lms-sman4-ternate/actions/workflows/ci.yml/badge.svg)](https://github.com/qllaarchive/website-lms-sman4-ternate/actions/workflows/ci.yml)
![Statis](https://img.shields.io/badge/deploy-Netlify-00C7B7)
![API](https://img.shields.io/badge/backend-Node%20%2B%20PostgreSQL-336791)
![Lisensi](https://img.shields.io/badge/license-MIT-green)

Portal pembelajaran digital **SMA Negeri 4 Ternate** — kumpulan LMS mata pelajaran kelas X, XI, dan XII dalam satu portal: materi, asesmen, gim edukatif, lab maya, e-book, dan forum diskusi. Dibangun statis (HTML/CSS/JS) agar ringan, cepat, dan tetap bisa diakses **tanpa internet**, dengan backend opsional untuk sinkronisasi pusat.

> **Coba langsung:** buka [`index.html`](index.html) di browser — tidak perlu build, tidak perlu server.

---

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Struktur Repositori](#struktur-repositori)
- [Menjalankan di Lokal](#menjalankan-di-lokal)
- [Validasi &amp; Pengujian Data](#validasi--pengujian-data)
- [Deploy](#deploy)
- [Menambah Mata Pelajaran Baru](#menambah-mata-pelajaran-baru)
- [Arsitektur Singkat](#arsitektur-singkat)
- [Mata Kuliah Terkait](#mata-kuliah-terkait)
- [Lisensi](#lisensi)

---

## Fitur

### Portal (`index.html`)

| Fitur | Keterangan |
|---|---|
| Pemilih kelas | Kelas X (Fase E), XI & XII (Fase F) — konten & progres terpisah per kelas |
| Tema tampilan | Terang / Gelap / Ikuti perangkat, tersimpan lokal, tanpa kedip saat muat |
| Pencarian | Filter daftar mapel secara instan |
| Admin | Login ber-salt + sesi 12 jam, tanpa cookie (aman untuk file:// & statis) |
| Kelola LMS | Tambah/ubah/hapus tautan LMS per kelas (nama, guru, warna, ikon, publikasi) |
| Pantau Progres | Ringkasan rata-rata + distribusi Selesai/Aktif/Belum dibuka, tabel per mapel, filter kelas, ekspor CSV & tautan Spreadsheet Guru |
| Cadangan data | Ekspor/impor JSON (daftar LMS, akun, progres) |
| PWA | Dapat dipasang di layar utama, service worker menyimpan berkas shell |
| Aksesibel | Semantik HTML, aria pada kontrol, dukungan *reduced-motion* |

### Halaman LMS per mapel

Setiap mata pelajaran memiliki halaman mandiri dengan model pembelajaran 6 unit:

- **Diagnostik → Formatif → Sumatif** — asesmen berjenjang dengan umpan balik langsung
- **Tujuan Pembelajaran & elemen CP** — selaras Kurikulum Merdeka (Fase E/F)
- **Gim edukatif** — kuis interaktif (papan pasang, cocokkan, simulasi)
- **Lab maya** — eksperimen/simulasi berbasis web
- **E-book & pustaka rujukan**
- **Forum diskusi** kelas
- **Jurnal/Refleksi** dan proyek per unit

Progres belajar disimpan otomatis di `localStorage` per perangkat — tetap tersimpan meski offline.

---

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend portal | HTML, CSS (variabel tema, tanpa framework), JavaScript ES5-siap-browser |
| Data LMS | Skrip JS berstruktur (`data/*.js`) yang divalidasi oleh alat uji |
| Backend (opsional) | Node.js, Express, Prisma, PostgreSQL |
| Keamanan API | Helmet, CORS terbatas, rate-limit, JWT/cookie, hash sandi ber-salt |
| Infrastruktur | Docker Compose, Nginx, GitHub Actions CI/CD, Netlify, Railway |
| Mobile (rencana) | Flutter — lihat [`mobile/README.md`](mobile/README.md) |

---

## Struktur Repositori

```
.
├── index.html               # Portal utama (daftar mapel, admin, pantau progres)
├── *.html                   # 16 halaman LMS per mata pelajaran
├── assets/
│   ├── portal.css/.js       # Gaya & logika portal
│   ├── lms.css/.js          # Engine halaman LMS (render unit, asesmen, gim, lab)
│   └── icons.js             # Ikon SVG inline
├── data/
│   ├── registry.js          # Daftar mapel (tautan, warna, guru, lsKey)
│   ├── matematika.js        # Konten LMS Matematika (137 tampilan)
│   └── sejarah.js           # Konten LMS Sejarah (136 tampilan)
├── scripts/
│   ├── validate.mjs         # Validasi skema data LMS
│   └── smoke.mjs            # Smoke test render (DOM stub) tanpa browser
├── api/                     # Backend Express + Prisma (login & sinkronisasi)
├── mobile/                  # Aplikasi Flutter (rencana)
├── docs/                    # Dokumen perkuliahan (website, sobj, tkti, netsec, mobile)
├── sw.js, manifest.webmanifest  # PWA (service worker + manifest)
├── docker-compose.yml       # db + api + portal untuk pengembangan lokal
└── .github/workflows/ci.yml # CI (syntax check) + deploy otomatis ke VPS
```

---

## Menjalankan di Lokal

### A. Portal saja (paling cepat)

```bash
git clone https://github.com/qllaarchive/website-lms-sman4-ternate.git
cd website-lms-sman4-ternate

# Buka langsung di browser (cukup, tanpa server):
open index.html

# — atau sajikan lewat server statis:
npx serve .
# lalu buka http://localhost:3000
```

### B. Portal + API + Database (pengembangan penuh)

```bash
docker compose up -d              # nyalakan db, api, dan portal
cd api && npx prisma migrate dev  # jalankan migrasi database
npm run seed                      # (opsional) isi data awal

# Portal  → http://localhost:8080
# API     → http://localhost:3000
```

### C. Backend saja (tanpa Docker)

```bash
cd api
npm ci
npx prisma migrate dev
npm run dev          # node --watch src/index.js
```

---

## Validasi &amp; Pengujian Data

Sebelum mengubah konten di `data/`, jalankan:

```bash
# 1. Validasi skema (wajib lolos, tanpa error)
node scripts/validate.mjs data/matematika.js

# 2. Smoke test render — memastikan semua tampilan ter-render tanpa exception
node scripts/smoke.mjs data/matematika.js

# 3. Cek sintaks portal
node --check assets/portal.js
```

Contoh keluaran yang sehat:

```
1 file · 0 error · 0 warning
views=137 binds=22 quizDone=true shell=true
SMOKE OK — matematika.js · 137 view dirender
```

---

## Deploy

Ringkasnya:

```
Netlify  → portal statis (index.html + halaman LMS)
Railway  → PostgreSQL + API login/admin
```

Langkah lengkap (screenshot termasuk) ada di **[DEPLOY.md](DEPLOY.md)**:

1. **Railway** — buat project → PostgreSQL → deploy API → set variabel (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`, …) → *Generate Domain*.
2. **Netlify** — import repo → build command `node scripts/build-config.mjs` → arahkan redirect `/api/*` ke URL Railway di `netlify.toml`.
3. **Login** — buka situs Netlify → tombol *Masuk* → akun admin dari Railway.

Push ke `main` akan memicu CI, lalu deploy otomatis ke VPS via SSH (lihat `.github/workflows/ci.yml`).

---

## Menambah Mata Pelajaran Baru

1. Buat konten `data/<id-mapel>.js` mengikuti kontrak `window.LMS_CONTENT`
   (meta wajib: `id` = nama berkas, `lsKey`, `scene`, CP/rasional, dsb).
2. Daftarkan di `data/registry.js` — **`lsKey` wajib sama** dengan `meta.lsKey`
   pada berkas konten.
3. Salin satu berkas `*.html` lama → ganti referensi berkas `data/<id-mapel>.js`.
4. Jalankan gate uji:

   ```bash
   node scripts/validate.mjs data/<id-mapel>.js
   node scripts/smoke.mjs data/<id-mapel>.js
   ```

5. Masuk sebagai admin → **Kelola** → tambahkan entri untuk tiap kelas
   (nama, guru, tautan, warna, ikon).

> Saat ini yang sudah berisi konten penuh: **Matematika** (137 tampilan) dan
> **Sejarah** (136 tampilan). 14 mapel lain sudah punya halaman siap diisi.

---

## Arsitektur Singkat

```
┌──────────────────────────┐        ┌──────────────────────────┐
│  Portal + Halaman LMS    │  /api  │  API (Express + Prisma)  │
│  statis, offline-first   │ ─────▶ │  auth, entri LMS, progres│
│  localStorage per kelas  │        │  JWT + rate-limit        │
└──────────────────────────┘        └────────────┬─────────────┘
                                                 │
                                      ┌──────────▼─────────────┐
                                      │      PostgreSQL        │
                                      └────────────────────────┘
```

- **Tanpa API pun portal tetap jalan** — admin login ke penyimpanan lokal,
  semua data tersimpan di perangkat masing-masing.
- Saat API tersedia (`config.js`), portal otomatis memakai sinkronisasi pusat
  (daftar LMS, entri per kelas) dengan fallback localStorage.

---

## Mata Kuliah Terkait

| Mata Kuliah | Kontribusi pada proyek |
|---|---|
| **Website** | Portal statis + PWA, Nginx, *security headers*, CI/CD |
| **Mobile** | Aplikasi Flutter *offline-first* (rencana di [`mobile/`](mobile)) |
| **SOBJ** | Sinkronisasi klien–server, caching, penanganan bentrok data |
| **TKTI** | Dokumen tata kelola, register risiko, jejak audit ([`docs/tkti/`](docs/tkti)) |
| **Keamanan Jaringan** | JWT, hash sandi, CORS, rate limit, uji penetrasi ([`docs/netsec/`](docs/netsec)) |

Dokumen laporan lengkap ada di [`docs/`](docs).

---

## Kontribusi

1. *Fork* & buat cabang fitur (`git checkout -b fitur/nama-anda`).
2. Pastikan gate uji hijau: `validate.mjs`, `smoke.mjs`, `node --check`.
3. Buka *Pull Request* dengan deskripsi perubahan yang jelas.

Jangan ubah `data/matematika.js` dan `data/sejarah.js` sembarangan —
keduanya sudah lolos validasi; jalankan ulang uji setiap mengubah konten.

---

## Lisensi

[MIT](LICENSE) © SMA Negeri 4 Ternate
