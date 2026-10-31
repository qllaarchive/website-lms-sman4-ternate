# LMS SMA Negeri 4 Ternate

[![CI](https://github.com/qllaarchive/website-lms-sman4-ternate/actions/workflows/ci.yml/badge.svg)](https://github.com/qllaarchive/website-lms-sman4-ternate/actions/workflows/ci.yml)
[![Deploy Status](https://img.shields.io/badge/deploy-Vercel%20%2F%20Netlify-00C7B7?style=flat&logo=vercel&logoColor=white)](https://vercel.com)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20PostgreSQL-336791?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Portal pembelajaran digital terpadu untuk **SMA Negeri 4 Ternate**. Menyediakan sistem manajemen pembelajaran (LMS) interaktif untuk jenjang Kelas X, XI, dan XII (Fase E & F Kurikulum Merdeka) yang mencakup materi, asesmen berjenjang, gim edukatif, lab maya, e-book, dan forum diskusi dalam satu platform ringan.

Dibangun dengan arsitektur hibrida: frontend statis (HTML/CSS/JS murni) untuk kecepatan dan performa maksimal, didukung oleh **backend Node.js & PostgreSQL** yang aman untuk manajemen data terpusat (tautan LMS, akun admin, profil sekolah, dan pemantauan progres).

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur & Teknologi](#-arsitektur--teknologi)
- [Struktur Repositori](#-struktur-repositori)
- [Menjalankan di Lokal](#-menjalankan-di-lokal)
- [Validasi & Pengujian Data](#-validasi--pengujian-data)
- [Panduan Deploy](#-panduan-deploy)
- [Menambah Mata Pelajaran Baru](#-menambah-mata-pelajaran-baru)
- [Integrasi Akademik](#-integrasi-akademik)
- [Lisensi](#-lisensi)

---

## 🚀 Fitur Utama

### 1. Portal Utama (`index.html`)
- **Pemilih Kelas Dinamis:** Pemisahan konten dan progres belajar antara Kelas X (Fase E), XI, & XII (Fase F).
- **Tema Kustom:** Dukungan mode Terang (*Light*), Gelap (*Dark*), dan Sinkronisasi Sistem tanpa *flash* saat dimuat.
- **Pencarian Instan:** Filter cepat untuk menemukan mata pelajaran yang diinginkan.
- **Autentikasi Admin:** Masuk aman menggunakan kredensial backend (JWT dengan cookies aman 7 hari).
- **Manajemen LMS:** Tambah, ubah, dan atur visibilitas tautan mapel per kelas secara *real-time* ke database.
- **Dashboard Pemantauan Progres:** Statistik rata-rata penyelesaian belajar siswa, filter kelas, dan ekspor data ke format CSV atau Spreadsheet Guru.
- **Profil Sekolah & PPDB:** Pengelolaan informasi institusi terpusat yang dapat diakses langsung dari footer portal.

### 2. Modul Pembelajaran per Mata Pelajaran
Setiap mata pelajaran dilengkapi modul mandiri (mis. Matematika dengan 137 tampilan, Sejarah, Fisika, dan PAI):
- **Alur Pembelajaran:** Diagnostik → Formatif → Sumatif dengan umpan balik instan.
- **Selaras Kurikulum Merdeka:** Berfokus pada Tujuan Pembelajaran dan Elemen Capaian Pembelajaran (CP).
- **Media Interaktif:** Gim edukatif, simulasi lab maya berbasis web, e-book, dan forum diskusi kelas.
- **Penyimpanan Lokal:** Progres belajar siswa otomatis tersimpan di `localStorage` per perangkat.

---

## 🛠️ Arsitektur & Teknologi

| Komponen | Teknologi yang Digunakan |
| :--- | :--- |
| **Frontend Portal** | HTML5, CSS3 (Custom Properties / CSS Variables, tanpa framework berat), Vanilla JavaScript (ES6+) |
| **Data LMS** | Skrip data terstruktur (`data/*.js`) tervalidasi otomatis |
| **Backend API** | Node.js, Express.js, Prisma ORM, PostgreSQL |
| **Keamanan** | Helmet.js, CORS Terbatas, Rate Limiting, JSON Web Token (JWT), Hashing Password (bcrypt) |
| **DevOps & CI/CD** | Docker & Docker Compose, Nginx, GitHub Actions, Vercel / Netlify (Frontend), Neon / Render (Backend & DB) |
| **Mobile (Rencana)** | Flutter (*Offline-first approach*) |

```text
┌─────────────────────────────────┐        ┌─────────────────────────────────┐
│       Portal & Halaman LMS      │  /api  │     Backend API (Express)       │
│  Statik, Cepat, Tanpa SSR Berat │ ─────▶ │  Manajemen Admin, Entri & Auth  │
│  Progres Tersimpan di Klien     │        │  Keamanan & Rate Limiting       │
└─────────────────────────────────┘        └────────────┬────────────────────┘
                                                        │
                                       ┌────────────────▼────────────────┐
                                       │       Database PostgreSQL       │
                                       └─────────────────────────────────┘
```

---

## 📁 Struktur Repositori

```text
.
├── public/                      # SEMUA file situs yang di-deploy (statis)
│   ├── index.html               # Portal utama (daftar mapel, panel admin, dashboard progres)
│   ├── mapel/                   # Halaman LMS mandiri per mata pelajaran
│   │   ├── matematika.html      # LMS Matematika (berkas mandiri penuh)
│   │   ├── fisika.html, sejarah.html, pendais.html
│   │   └── 12+ shell mapel lainnya
│   ├── assets/                  # portal.css/js, lms.css/js (engine), icons.js
│   └── data/                    # registry.js + konten matematika/fisika/sejarah/pendais
├── scripts/
│   ├── validate.mjs             # Skrip validasi skema data LMS
│   ├── smoke.mjs                # Uji render otomatis (DOM stub) tanpa browser
│   ├── build-*.mjs              # Skrip kompilasi berkas mandiri (standalone build)
│   └── build-config.mjs         # Penghasil konfigurasi API dinamis saat proses build
├── apps-script/                 # Integrasi Google Apps Script pendukung guru (?gs=)
├── api/                         # Backend Express, konfigurasi Prisma, dan migrasi database
├── mobile/                      # Kerangka aplikasi mobile Flutter
├── docs/                        # Dokumentasi teknis & laporan akademik (Website, SOBJ, TKTI, NetSec)
├── docker-compose.yml           # Orkorstrasi lokal (PostgreSQL + API + Portal)
├── DEPLOY.md                    # Panduan deploy terperinci
└── .github/workflows/ci.yml     # Konfigurasi Continuous Integration & deployment otomatis
```

---

## 💻 Menjalankan di Lokal

### Prasyarat
- [Node.js](https://nodejs.org/) (versi LTS direkomendasikan)
- [Docker & Docker Compose](https://www.docker.com/) (opsional, untuk menjalankan database dan API secara instan)

### A. Mode Pengembangan Penuh (Docker + API + Database)
```bash
# 1. Jalankan kontainer database, API, dan portal
docker compose up -d

# 2. Masuk ke direktori API dan jalankan migrasi database
cd api && npx prisma migrate dev

# 3. Masukkan data awal (seed) untuk akun admin dan data uji
npm run seed

# Akses layanan:
# - Portal Frontend : http://localhost:8080
# - Backend API     : http://localhost:3000
```

### B. Mode Pengembangan Cepat (Backend Saja Tanpa Docker)
```bash
cd api
npm ci
npx prisma migrate dev
npm run seed
npm run dev          # Menjalankan server dengan pengawas (node --watch)
```
> **Catatan:** Backend **wajib** aktif agar fitur login, manajemen tautan LMS, dan profil sekolah berfungsi penuh. Tanpa backend, portal akan berjalan dalam mode baca-saja (*read-only*) menggunakan data lokal bawaan.

---

## 🧪 Validasi & Pengujian Data

Sebelum melakukan *commit* atau mengubah konten pada direktori `data/`, pastikan validasi dan uji render berhasil:

```bash
# 1. Validasi struktur skema data LMS
node scripts/validate.mjs data/matematika.js

# 2. Uji render (smoke test) untuk memastikan seluruh tampilan termuat tanpa error
node scripts/smoke.mjs data/matematika.js

# 3. Pemeriksaan sintaks skrip portal
node --check assets/portal.js
```

Contoh hasil pengujian yang sukses:
```text
1 file · 0 error · 0 warning
views=137 binds=22 quizDone=true shell=true
SMOKE OK — matematika.js · 137 view dirender
```

---

## 🚢 Panduan Deploy

Arsitektur aplikasi memisahkan layanan frontend statis dan backend API demi skalabilitas maksimal:

1. **Database PostgreSQL:** Gunakan layanan gratis selamanya seperti [Neon](https://neon.tech) atau [Supabase](https://supabase.com). Salin *Connection String* `DATABASE_URL`.
2. **Backend API:** Deploy direktori `api/` ke [Render](https://render.com), Railway, atau VPS pribadi. Atur variabel lingkungan:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_USER` & `ADMIN_PASS`
   - `ALLOWED_ORIGINS` (URL domain frontend Anda)
3. **Frontend Portal:** Deploy folder `public/` ke [Vercel](https://vercel.com), [Netlify](https://netlify.com), atau GitHub Pages. Atur variabel `LMS_API_BASE` mengarah ke URL backend API Anda.

Panduan langkah demi langkah yang lebih lengkap tersedia di berkas **[DEPLOY.md](DEPLOY.md)**.

---

## 📚 Menambah Mata Pelajaran Baru

1. Buat berkas konten baru di `public/data/<id-mapel>.js` mengikuti kontrak format `window.LMS_CONTENT` (pastikan properti `id` dan `lsKey` sesuai dengan nama berkas).
2. Daftarkan entri baru di dalam `public/data/registry.js` dengan `lsKey` yang sama persis.
3. Duplikat templat halaman dari direktori `public/mapel/` dan arahkan pemuatan berkas ke `../data/<id-mapel>.js`.
4. Jalankan perintah validasi dan uji render (`validate.mjs` & `smoke.mjs`).
5. Masuk ke halaman portal sebagai admin, buka menu **Kelola**, dan tambahkan entri mapel baru untuk setiap kelas.

---

## 🎓 Integrasi Akademik

Proyek ini dikembangkan sebagai bagian dari portofolio dan pemenuhan tugas mata kuliah terkait:
- **Website:** Pengembangan antarmuka statis, konfigurasi Nginx, pengamanan *header*, dan alur CI/CD.
- **Mobile Development:** Perencanaan aplikasi *offline-first* dengan Flutter (`mobile/`).
- **SOBJ:** Sinkronisasi klien-server, strategi *caching*, dan penanganan konflik data.
- **TKTI:** Tata kelola sistem, manajemen risiko, dan jejak audit terdokumentasi (`docs/tkti/`).
- **Keamanan Jaringan:** Implementasi JWT, enkripsi *password*, CORS ketat, *rate limiting*, dan uji penetrasi (`docs/netsec/`).

Dokumentasi laporan lengkap dapat ditemukan di direktori [`docs/`](docs).

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE) © SMA Negeri 4 Ternate.
