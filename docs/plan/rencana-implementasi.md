# Rencana Implementasi — Portal LMS SMA Negeri 4 Ternate

> Arah baru pekerjaan (per 27 Okt 2026): website **ditahan di localhost** dulu dengan
> **backend hidup dan tersambung**, sambil memperbaiki tampilan & isi sampai layak.
> Setelah itu → buat **Ubuntu Server di VirtualBox khusus demo** untuk guru pendamping
> → setelah di-ACC → baru **hosting versi online**.

---

## Fase 0 — Baseline (sudah selesai)

- ✅ Bug besar & keamanan sudah ditambal (commit `c06aee8`): CSP nginx, tombol beranda
  di 16 halaman mapel, guard 12 shell mapel, perbaikan `portal.js` (lsKey, escape href,
  pesan backend mati, banner `.noback`), dll.
- ✅ Token Bearer / lintas origin (commit `8e30118`), backend wajib di semua opsi deploy.
- ✅ Verifikasi: `node scripts/validate.mjs` → 4 file · 0 error; smoke test data mapel OK.
- ✅ Repo dipush ke `main`: `https://github.com/qllaarchive/website-lms-sman4-ternate.git`
- ✅ Infrastruktur siap: `docker-compose.yml` (db + api + portal nginx), `DEPLOY.md`,
  `portal-nginx.conf`.
- ⏳ **Satu isu terbuka**: halaman pembuka (intro) terasa "ter-zoom" dan tombolnya tidak
  berfungsi di Chrome (Chrome headless menangkap hal sama pada localhost maupun file://
  → ini bug kode, bukan masalah server).

---

## Fase 1 — Localhost full-stack: backend hidup + tersambung (1–2 hari)

Tujuan: satu perintah untuk menjalankan **db + API + portal** bersamaan di Mac.

### Opsi A (disarankan) — Docker Desktop, satu perintah
1. Install Docker Desktop for Mac → https://www.docker.com/products/docker-desktop/
2. Pastikan `api/.env` terisi (sudah ada: `ADMIN_USER="admin"`, `ADMIN_PASS="Admin123!"`,
   `JWT_SECRET` acak hex)
3. Jalankan:
   ```bash
   docker compose up --build
   ```
   - Portal → http://localhost:8080 (nginx mem-proxy `/api` ke API)
   - API → http://localhost:3000/api
   - DB → postgres:16-alpine di port 5432 (volume `pgdata` bertahan antar-restart)

### Opsi B (tanpa Docker) — Postgres via Homebrew
1. `brew install postgresql@16 && brew services start postgresql@16`, buat db/user
   sesuai `api/.env`
2. API: `cd api && npm ci && npx prisma migrate dev && npm run dev` (port 3000)
3. Portal statis: `python3 -m http.server 8080 --bind 127.0.0.1`
4. Lintas asal aman di localhost (CORS sudah mengizinkan origin `http://localhost*`,
   cookie SameSite=Lax tetap terkirim antar-port)

### Pemberesan dev (opsional)
- Tambahkan `scripts/dev.mjs` (Node, tanpa dependensi): http statis port 8080 + proxy
  `/api` → `127.0.0.1:3000` — front + API jalan dengan satu perintah tanpa nginx.

### Kriteria selesai Fase 1
- [ ] `docker compose up` hidup tanpa error (atau jalur Opsi B lolos)
- [ ] Login admin → masuk mode kelola (memakai DB lokal)
- [ ] CRUD satu entri LMS (buat + edit + hapus + terbaca di kartu portal)
- [ ] Progres siswa tersimpan dan tampil di "Pantau Progres"
- [ ] `node scripts/validate.mjs` tetap 0 error

---

## Fase 2 — Polishing tampilan & isi (berjalan sampai layak demo)

### 2.1 Pertama: perbaiki halaman pembuka (prioritas utama)
- Reproduksi di Chrome biasa (bukan headless), buka DevTools → Console/Network.
- Teliti blok intro `assets/portal.css` (± baris 740–830):
  - `.intro-title` (clamp hingga 184px) → maksimum 184px terlalu besar untuk laptop;
    kecilkan nilai minimum/maksimum agar tidak terkesan "ter-zoom".
  - `.intro-bg img` + animasi `introZoom 12s` → perkecil skala zoom.
  - Pastikan `.intro-school` & `.intro-cta` (tombol **Mulai**) tampil dan tombol benar
    memicu `enter()` di `assets/intro.js` (klik tombol, cek console untuk error JS).
- Screenshot sebelum/sesudah (`/tmp/lms-local.png`) untuk pembanding.

### 2.2 Isi mapel (keputusan)
- Saat ini **4 mapel** ber-data (`fisika`, `matematika`, `sejarah`, `pendais`) dan
  **12 shell** "belum terbit". Pilih:
  - (a) isi data mapel baru secara bertahap (ikuti pola `data/fisika.js` dst.), atau
  - (b) rampingkan copy footer agar jujur ("4 terbit, 12 disiapkan").
- Rapikan juga copy/konten lain yang terasa janggal saat dipakai.

### 2.3 Pemeriksaan mutu sebelum demo
- [ ] 0 error Console untuk semua menu header & interaksi
- [ ] Lighthouse (Desktop, `/index.html`): Performance ≥ 90, Accessibility ≥ 90
- [ ] Uji manual: mode gelap, intro → portal, tombol beranda tiap mapel,
      login/logout admin, tambah/edit/hapus LMS, pantau progres, unduh materi,
      halaman forum/gim/sosial, halaman Apps Script (sejarah, pendais) berjalan
      normal dengan internet
- [ ] Screenshot utama tidak ada teks terpotong/tergeser

---

## Fase 3 — Demo di Ubuntu Server (VirtualBox)

> Demo singkat (± 10–15 menit) jalan lokal di VM — tanpa biaya,
> tanpa hosting, dan bisa di-restore bila gagal.

### 3.1 Persiapan VM (sekali)
1. Install **VirtualBox**, unduh ISO **Ubuntu 24.04** sesuai arsitektur Mac
   (lihat bagian Risiko soal ARM).
2. Spesifikasi VM: **2 CPU · 4 GB RAM · 25 GB disk**.
3. Mode jaringan **Bridged** agar Mac bisa membuka `http://<IP-VM>:8080`.
4. Install di VM: `git`, `docker.io`, plugin `docker compose`.

### 3.2 Menjalankan stack di VM
```bash
sudo apt update && sudo apt install -y git docker.io docker-compose-v2
git clone https://github.com/qllaarchive/website-lms-sman4-ternate.git
cd website-lms-sman4-ternate
# buat api/.env di VM: JWT_SECRET acak, ADMIN_USER/ADMIN_PASS khusus demo
docker compose up -d --build
```
- Alamat yang dipamerkan: **http://<IP-VM>:8080** (nginx proxy `/api` → API port 3000).

### 3.3 Snapshot & data demo
- **Snapshot VM sebelum demo** (`Snapshot 1 – siap demo`) → bila kelola/isi berantakan
  saat demo, `Restore` mulus.
- `api/.env` di VM memakai kredensial **khusus demo** (bukan yang dirahasiakan),
  `JWT_SECRET` acak, dan `ALLOWED_ORIGINS` mengarah ke `http://<IP-VM>:8080` bila perlu.
- Catat: volume `pgdata` menjaga data demo tidak hilang antar-restart.

### 3.4 Naskah demonstrasi (10–15 menit)
1. Buka `http://<IP-VM>:8080` di browser Mac → intro animasi + tombol Mulai bekerja.
2. Beranda: kartu `Materi & Tugas`, `Pantau Progres`, `Kolaborasi` (forum/gim/sosial),
   profil sekolah, mode gelap.
3. Buka satu mapel terbit (fisika) → navigasi materi, kuis, tombol beranda kembali.
4. Login admin → mode kelola → tambah materi baru → muncul di kartu → pantau progres.
5. (Jika guru bertanya infrastruktur) buka tab terminal dengan `docker compose ps`
   sebagai bukti stack berjalan di Ubuntu.

### 3.5 Kriteria selesai Fase 3
- [ ] Snapshot VM bekerja: demo bisa direset ke titik "siap" kapan pun
- [ ] Naskah demonstrasi 3.4 dijalankan penuh 1× tanpa hambatan
- [ ] Data demo (materi + progres siswa) sudah terisi sebelum guru datang

---

## Fase 4 — Setelah di-ACC: hosting versi online

Pilih jalur sesuai `DEPLOY.md` (tanpa perubahan kode, hanya konfigurasi):
- **Jalur gratis**: Netlify/Vercel (portal statis) + **Neon** (Postgres gratis) +
  **Render free tier** (API Node).
- `vercel.json` & `netlify.toml` sudah tersedia — tinggal isi placeholder URL.
- Pemeriksaan pra-produksi:
  - [ ] `JWT_SECRET` baru yang kuat (32 byte hex)
  - [ ] `ADMIN_PASS` baru (berbeda dari demo)
  - [ ] `ALLOWED_ORIGINS` mengarah ke domain kanonik (mis. `https://<domain>.netlify.app`)
  - [ ] HTTPS aktif (Netlify/Vercel otomatis; Render TLS gratis)
  - [ ] `LMS_API_BASE` dibangun via `scripts/build-config.mjs` menunjuk API produksi

---

## Risiko dan mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Demo VM butuh internet untuk font Google & halaman Apps Script (sejarah, pendais) | Mode bridged agar VM dapat internet; atau siapkan tangkapan layar cadangan |
| VirtualBox di Mac Apple Silicon masih terbatas | Pakai ISO Ubuntu 24.04 ARM untuk Mac M-series; uji dulu 2CPU/4GB |
| Isi "kelola" berantakan saat demo | Snapshot VM untuk rollback; kredensial admin terpisah |
| Data demo kacau | `docker compose down -v` lalu isi ulang data demo sebelum showcase |
| Guru menyuruh deploy cepat | `DEPLOY.md` + `README.md` sudah siap sebagai panduan jawaban |

## Timeline ringkas

| Fase | Perkiraan |
| --- | --- |
| 1 Localhost full-stack | 1–2 hari (install Docker + uji CRUD) |
| 2 Polish | berjalan sampai puas |
| 3 Demo Ubuntu VirtualBox | 1 hari persiapan + hari-H |
| 4 Hosting | 0,5–1 hari setelah ACC |

> Catatan: tidak ada perubahan kode untuk Fase 3→4 — cukup `.env`, `ALLOWED_ORIGINS`,
> dan deployment.
