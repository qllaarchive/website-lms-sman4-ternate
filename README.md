# LMS SMA Negeri 4 Ternate

[![CI](https://github.com/qllaarchive/website-lms-sman4-ternate/actions/workflows/ci.yml/badge.svg)](https://github.com/qllaarchive/website-lms-sman4-ternate/actions/workflows/ci.yml)
![Statis](https://img.shields.io/badge/deploy-Netlify%20%2F%20Vercel-00C7B7)
![API](https://img.shields.io/badge/backend-Node%20%2B%20PostgreSQL-336791)
![Lisensi](https://img.shields.io/badge/license-MIT-green)

Portal pembelajaran digital **SMA Negeri 4 Ternate** — kumpulan LMS mata pelajaran kelas X, XI, dan XII dalam satu portal: materi, asesmen, gim edukatif, lab maya, e-book, dan forum diskusi. Dibangun statis (HTML/CSS/JS) agar ringan dan cepat, dengan **backend wajib** sebagai pusat data (tautan LMS, akun admin, profil sekolah). Tanpa backend portal hanya membaca data bawaan (mode baca saja).

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
| Admin | Login admin lewat backend (email + sandi, tanpa pendaftaran akun), sesi cookie JWT 7 hari |
| Kelola LMS | Tambah/ubah/hapus tautan LMS per kelas (nama, guru, warna, ikon, publikasi) — tersimpan di database |
| Pantau Progres | Ringkasan rata-rata + distribusi Selesai/Aktif/Belum dibuka, tabel per mapel, filter kelas, ekspor CSV & tautan Spreadsheet Guru |
| Profil Sekolah | Identitas, kontak, dan PPDB — tersimpan di database, dikelola admin, dibuka dari footer |
| Aksesibel | Semantik HTML, aria pada kontrol, dukungan *reduced-motion* |

Tautan mapel dapat membawa parameter `?gs=<scriptId>` untuk membuka **Google Apps Script**
dari guru ([`apps-script/Code.gs`](apps-script/Code.gs)) langsung dari kartu portal.

### Halaman LMS per mapel

Setiap mata pelajaran memiliki halaman mandiri (6 unit Matematika; 12 unit Sejarah dan PAI):

- **Diagnostik → Formatif → Sumatif** — asesmen berjenjang dengan umpan balik langsung
- **Tujuan Pembelajaran & elemen CP** — selaras Kurikulum Merdeka (Fase E/F)
- **Gim edukatif** — kuis interaktif (papan pasang, cocokkan, simulasi)
- **Lab maya** — eksperimen/simulasi berbasis web
- **E-book & pustaka rujukan**
- **Forum diskusi** kelas
- **Jurnal/Refleksi** dan proyek per unit

Progres belajar disimpan otomatis di `localStorage` per perangkat — data tautan LMS, akun admin, dan profil sekolah tersimpan di database (PostgreSQL) melalui API.

---

## Teknologi

| Lapisan | Teknologi |
|---|---|
| Frontend portal | HTML, CSS (variabel tema, tanpa framework), JavaScript ES5-siap-browser |
| Data LMS | Skrip JS berstruktur (`data/*.js`) yang divalidasi oleh alat uji |
| **Backend (wajib)** | Node.js, Express, Prisma, PostgreSQL |
| Keamanan API | Helmet, CORS terbatas, rate-limit, JWT/cookie, hash sandi ber-salt |
| Infrastruktur | Docker Compose, Nginx, GitHub Actions CI/CD, Netlify/Vercel/GitHub Pages, Neon, Render, Railway |
| Mobile (rencana) | Flutter — lihat [`mobile/README.md`](mobile/README.md) |

---

## Struktur Repositori

```
.
├── index.html               # Portal utama (daftar mapel, admin, pantau progres)
├── mapel/                   # Halaman LMS per mata pelajaran (aktif + cadangan)
│   ├── matematika.html      # LMS Matematika (berkas mandiri)
│   ├── fisika.html, sejarah.html, pendais.html
│   └── 12 shell mapel berikutnya (bahasa-indonesia, biologi, dst.)
├── assets/
│   ├── portal.css/.js       # Gaya & logika portal
│   ├── lms.css/.js          # Engine halaman LMS (render unit, asesmen, gim, lab)
│   ├── icons.js             # Ikon SVG inline
│   └── logo & gambar intro/deploy
├── data/
│   ├── registry.js          # Daftar mapel portal (lsKey, warna, emoji, scriptId Apps Script)
│   ├── matematika.js        # Konten LMS Matematika (137 tampilan)
│   ├── fisika.js            # Konten LMS Fisika
│   ├── sejarah.js           # Konten LMS Sejarah (136 tampilan)
│   └── pendais.js           # Konten LMS PAI (141 tampilan)
├── scripts/
│   ├── validate.mjs         # Validasi skema data LMS
│   ├── smoke.mjs            # Smoke test render (DOM stub) tanpa browser
│   ├── build-pendais.mjs    # Build mapel/pendais.html menjadi satu berkas mandiri
│   ├── build-sejarah.mjs    # Build mapel/sejarah.html menjadi satu berkas mandiri
│   ├── pendais.template.html # Shell, tema, logo, dan banner PAI
│   └── build-config.mjs     # Generate config.js (API base) saat build deploy
├── apps-script/             # Kode Google Apps Script (dituju parameter ?gs=)
├── api/                     # Backend Express + Prisma (login & sinkronisasi)
├── mobile/                  # Aplikasi Flutter (rencana)
├── docs/                    # Dokumen perkuliahan (website, sobj, tkti, netsec, mobile)
├── netlify.toml, vercel.json  # Konfigurasi deploy (pilih salah satu) + base URL API
├── portal-nginx.conf        # Konfigurasi Nginx (deploy VPS)
├── docker-compose.yml       # db + api + portal untuk pengembangan lokal
├── DEPLOY.md                # Panduan langkah-demi-langkah deploy
└── .github/workflows/ci.yml # CI (syntax check) + deploy otomatis ke VPS
```

---

## Menjalankan di Lokal

### A. Portal + API + Database (pengembangan penuh — backend tetap hidup)

```bash
docker compose up -d              # nyalakan db, api, dan portal
cd api && npx prisma migrate dev  # jalankan migrasi database
npm run seed                      # isi data awal (akun admin + 4 entri LMS)

# Portal  → http://localhost:8080
# API     → http://localhost:3000
```

### B. Backend saja (tanpa Docker — untuk pengembangan cepat)

```bash
cd api
npm ci
npx prisma migrate dev
npm run seed
npm run dev          # node --watch src/index.js
# Portal disajikan dari server statis apa pun (python/npx serve) yang
# memproksi /api → http://localhost:3000, atau sementara langsung
# LMS_API_BASE=http://localhost:3000/api (CORS localhost diizinkan).
```

> **Aturan:** backend **selalu wajib nyala** saat portal dipakai. Tanpa backend,
> portal hanya menampilkan data bawaan (baca saja) — login, kelola LMS,
> dan profil sekolah tidak berfungsi, dan portal menampilkan banner
> "backend tidak terhubung".

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

Ringkasnya — **backend wajib** di setiap opsi hosting:

```
Netlify/Vercel/GitHub Pages → portal statis (index.html + halaman LMS)
Neon                        → database PostgreSQL (gratis selamanya)
Render                      → backend API (gratis selamanya)
```

Langkah lengkap ada di **[DEPLOY.md](DEPLOY.md)**:

1. **Neon** — buat project → copy connection string `DATABASE_URL` (gratis, tanpa kartu).
2. **Render** — Web Service (Root Directory `api`) → isi `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS` → deploy.
3. **Portal** — import repo:
   - **Netlify/Vercel** — konfigurasi sudah ada (`netlify.toml`/`vercel.json`); ganti URL Render di file redirect tersebut.
   - **GitHub Pages** — saat build set environment `LMS_API_BASE=https://url-render/api` (mis. via Actions/workflow) — portal memanggil API langsung lintas origin, jadi `ALLOWED_ORIGINS` di Render wajib memuat `https://<username>.github.io`.
4. Isi `ALLOWED_ORIGINS` di Render dengan URL portal final.
5. **Login** — buka situs portal → tombol *Masuk* → akun admin dari variabel Render.

Alternatif satu-dashboard: Railway — API + PostgreSQL berbayar (mulai ~$5/bulan), panduan di DEPLOY.md.

Push ke `main` akan memicu CI, lalu deploy otomatis ke VPS via SSH (lihat `.github/workflows/ci.yml`).

---

## Menambah Mata Pelajaran Baru

1. Buat konten `data/<id-mapel>.js` mengikuti kontrak `window.LMS_CONTENT`
   (meta wajib: `id` = nama berkas, `lsKey`, `scene`, CP/rasional, dsb).
2. Daftarkan di `data/registry.js` — **`lsKey` wajib sama** dengan `meta.lsKey`
   pada berkas konten.
3. Salin satu berkas lama dari `mapel/` → ganti referensi berkas `data/<id-mapel>.js`.
4. Jalankan gate uji:

   ```bash
   node scripts/validate.mjs data/<id-mapel>.js
   node scripts/smoke.mjs data/<id-mapel>.js
   ```

5. Masuk sebagai admin → **Kelola** → tambahkan entri untuk tiap kelas
   (nama, guru, tautan, warna, ikon).

> Saat ini yang sudah berisi konten penuh: **Matematika** (137 tampilan),
> **Fisika** (135 tampilan, [`mapel/fisika.html`](mapel/fisika.html)),
> **Sejarah** (136 tampilan, [`mapel/sejarah.html`](mapel/sejarah.html)),
> dan **Pendidikan Agama Islam** (141 tampilan, [`mapel/pendais.html`](mapel/pendais.html)).
> 12 mapel lain sudah punya halaman shell siap diisi di `mapel/`.

---

## Arsitektur Singkat

```
┌──────────────────────────┐        ┌──────────────────────────┐
│  Portal + Halaman LMS    │  /api  │  API (Express + Prisma)  │
│  statis, tanpa JS server │ ─────▶ │  auth, entri LMS, profil │
│  progres murid per dev.  │        │  JWT + rate-limit        │
└──────────────────────────┘        └────────────┬─────────────┘
                                                 │
                                      ┌──────────▼─────────────┐
                                      │      PostgreSQL        │
                                      └────────────────────────┘
```

- **Data pusat di database** — tautan LMS per kelas, akun admin, dan profil
  sekolah disimpan di PostgreSQL dan dirilis lewat API (`/api/lms`, `/api/auth`, `/api/school`).
- Portal tetap menampilkan tautan mapel tanpa API: kembali ke daftar bawaan
  `data/registry.js` (baca-saja); kelola & profil membutuhkan backend.
- Kartu mapel dapat membawa `?gs=<scriptId>` → **Google Apps Script**
  ([`apps-script/Code.gs`](apps-script/Code.gs)) untuk spreadsheet guru/eksternal.

---

## Mata Kuliah Terkait

| Mata Kuliah | Kontribusi pada proyek |
|---|---|
| **Website** | Portal statis, Nginx, *security headers*, CI/CD |
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
