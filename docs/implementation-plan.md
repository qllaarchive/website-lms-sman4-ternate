# Implementation Plan — Konversi Mata Kuliah MBKM
## Proyek: Portal LMS SMA Negeri 4 Ternate

**Pemilik:** [NAMA] — [NIM]
**Program Studi:** Informatika, Fakultas Teknik, Universitas Khairun
**Periode:** [TANGGAL MULAI] – [TANGGAL SELESAI]
**Repositori:** https://github.com/qllaarchive/website-lms-sman4-ternate
**Referensi pola:** Laporan MBKM Haydar Qisyaam Sangadji (Radya Labs Digital, 2025)

---

## 1. Ringkasan

Proyek **Portal LMS SMA Negeri 4 Ternate** dikonversi menjadi bukti ketercapaian
**5 mata kuliah** melalui satu proyek terintegrasi. Setiap mata kuliah diklaim
melalui aspek/artefak berbeda dari proyek yang sama — mengikuti pola laporan
senior (satu proyek, banyak sudut pandang).

| Mata Kuliah | Aspek yang Diklaim | Kesiapan Awal |
|-------------|--------------------|---------------|
| Website | Portal LMS (HTML/CSS/JS, PWA, CRUD, responsive) | 🟢 85% |
| Mobile | Aplikasi Flutter (WebView → native) | 🔴 0% |
| SOBJ | Arsitektur client-server Ubuntu (Nginx, API, PostgreSQL, firewall) | 🟡 55% |
| TKTI | Tata kelola: kebijakan, risiko, audit, stakeholder | 🔴 25% |
| Keamanan Jaringan | Autentikasi, HTTPS, hardening, pentest | 🟡 65% |

---

## 2. Aset Proyek Saat Ini

### 2.1 Kode & Aplikasi
| Aset | Lokasi | Keterangan |
|------|--------|------------|
| Portal LMS | `index.html`, `assets/portal.js`, `assets/portal.css` | CRUD admin, pencarian, tema, pengumuman, profil, backup |
| Engine LMS | `assets/lms.js`, `assets/lms.css` | Mesin materi/kuis/gim/lab |
| Data mapel | `data/matematika.js`, `data/sejarah.js` | 2 dari 16 mapel tersedia |
| PWA | `manifest.webmanifest`, `sw.js` | Offline-first, installable |
| API Backend | `api/` | Express + Prisma + PostgreSQL + JWT + Argon2 |
| Keamanan API | `api/src/index.js`, `api/src/routes/auth.js` | Helmet CSP/HSTS, rate limit, CORS, validasi Zod |
| Audit log | `api/src/middleware/audit.js` | Pencatatan aksi admin |
| Docker | `docker-compose.yml`, `api/Dockerfile`, `portal-nginx.conf` | Stack siap jalan |
| CI/CD | `.github/workflows/ci.yml` | Lint + deploy via SSH |
| Script uji | `scripts/validate.mjs`, `scripts/smoke.mjs` | Validasi data + smoke test render |

### 2.2 Dokumen
| Aset | Lokasi | Status |
|------|--------|--------|
| Laporan Website | `docs/website/laporan.html` | Kerangka |
| Laporan Mobile | `docs/mobile/flutter-plan.md` | Rencana |
| Laporan SOBJ | `docs/sobj/arsitektur.md` | Kerangka |
| Laporan TKTI | `docs/tkti/governance.md` | Kerangka |
| Laporan NetSec | `docs/netsec/penetration-test.md` | Kerangka |

### 2.3 Infrastruktur
| Aset | Status |
|------|--------|
| GitHub repo | ✅ Aktif |
| Netlify (portal) | ⬜ Belum |
| VM Ubuntu (VirtualBox) | ⬜ Belum dibuat |
| VPS (opsional) | ⬜ Belum |
| Flutter SDK | ✅ Tersedia (`~/Downloads/flutter`) |

---

## 3. Daftar Mata Kuliah Konversi

> ⚠️ Kode MK dan SKS wajib disesuaikan dengan KRS/transkrip masing-masing.
> Kode di bawah mengacu pada kurikulum yang sama dengan laporan senior.

| No | Kode MK | Nama Mata Kuliah | SKS | Jenis |
|----|---------|------------------|-----|-------|
| 1 | TIK63154* | Pemrograman Web / Website | 4 | Wajib |
| 2 | [cek KRS] | Pemrograman Mobile | [cek] | Wajib |
| 3 | [cek KRS] | Sistem Operasi Berbasis Jaringan (SOBJ) | [cek] | Wajib |
| 4 | TIK63352 | Tata Kelola Teknologi Informasi | 2 | Wajib |
| 5 | TIK63553 | Keamanan Jaringan Komputer | 3 | Wajib |

\* Kode mengacu kurikulum Informatika Unkhair — verifikasi ulang.

---

## 4. Rencana per Mata Kuliah

### 4.1 Website (Pemrograman Web)

**Artefak yang diklaim:** Portal LMS berbasis web dengan PWA, CRUD admin, dan
UI responsif.

**Sudah tersedia:**
- [x] Portal lengkap (`index.html` + `portal.js`)
- [x] PWA (`sw.js` + `manifest.webmanifest`)
- [x] Engine LMS + 2 data mapel
- [x] Script pengujian (`validate.mjs`, `smoke.mjs`)

**Pekerjaan:**
1. [ ] Perbaiki 14 halaman mapel yang memuat `data/*.js` tidak ada
       (buat data minimal atau sembunyikan dari registry)
2. [ ] Deploy portal ke Netlify (drag & drop folder atau Git integration)
3. [ ] Jalankan Lighthouse → target skor ≥ 90 (Performance, A11y, Best Practices, SEO)
4. [ ] Ambil screenshot:
       - Halaman utama portal (desktop + mobile)
       - Modal Kelola LMS (CRUD)
       - Modal Pantau Progres
       - Mode gelap
       - Hasil Lighthouse
5. [ ] Siapkan potongan kode untuk lampiran:
       - `card()` dan `render()` di `portal.js`
       - Handler form kelola (`kForm.addEventListener`)
       - `sw.js` (service worker)
6. [ ] Tulis Bab VI sub-bab Pemrograman Web

**Bukti minimum:** URL Netlify + 5 screenshot + 3 potongan kode + Lighthouse.

**Estimasi:** 1 hari.

---

### 4.2 Mobile (Pemrograman Mobile)

**Artefak yang diklaim:** Aplikasi Android Flutter yang membungkus portal LMS,
dengan rencana pengembangan lanjutan (offline-first, notifikasi).

**Pekerjaan:**
1. [ ] `flutter create mobile_lms` (pakai SDK di `~/Downloads/flutter`)
2. [ ] Fase 1 — WebView wrapper:
       - `webview_flutter` memuat URL portal (Netlify atau IP VM)
       - Splash screen + ikon aplikasi
       - Tombol back/refresh
3. [ ] Build APK release: `flutter build apk --release`
4. [ ] Fase 2 (nilai plus) — port native minimal:
       - List kartu mapel dari API
       - Halaman detail + progres
       - Login admin sederhana
5. [ ] Screenshot aplikasi di HP/emulator + video demo 1 menit
6. [ ] Tulis Bab VI sub-bab Mobile + Bab II (definisi Flutter, Dart, WebView)

**Bukti minimum:** APK + 4 screenshot + potongan `main.dart` + video demo.

**Estimasi:** 2–3 hari.

---

### 4.3 SOBJ (Sistem Operasi Berbasis Jaringan)

**Artefak yang diklaim:** Server Ubuntu yang menjalankan portal, API, dan database
sebagai layanan jaringan nyata, diakses dari komputer klien.

**Infrastruktur:**
- VirtualBox VM: Ubuntu Server 24.04, 4GB RAM, 2 vCPU, 25GB disk
- Network: **Bridged Adapter** (VM dapat IP dari router)
- Akses dari Mac via SSH + browser

**Pekerjaan:**
1. [ ] Install VirtualBox + Ubuntu Server (centang OpenSSH)
2. [ ] Akses remote: `ssh lms@<IP-VM>` (screenshot)
3. [ ] Install layanan:
       ```bash
       sudo apt update && sudo apt install -y nginx git nodejs npm postgresql ufw
       ```
4. [ ] Deploy portal:
       ```bash
       git clone https://github.com/qllaarchive/website-lms-sman4-ternate.git
       sudo cp -r website-lms-sman4-ternate/* /var/www/html/
       ```
5. [ ] Konfigurasi Nginx reverse proxy `/api/` → `127.0.0.1:3000`
6. [ ] Jalankan API sebagai **systemd service** (`lms-api.service`)
7. [ ] Buat database + migrasi Prisma + seed admin
8. [ ] Konfigurasi firewall:
       ```bash
       sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
       ```
9. [ ] Ambil bukti:
       - [ ] Diagram arsitektur (client → nginx → api → db)
       - [ ] `ip a`, `ip route`, `ss -tulpn`
       - [ ] `systemctl status nginx postgresql lms-api`
       - [ ] `ufw status verbose`
       - [ ] Akses browser dari Mac (screenshot)
       - [ ] `tail /var/log/nginx/access.log`
       - [ ] Uji offline: matikan Wi-Fi Mac → portal tetap terbuka (service worker)
       - [ ] Uji fault: stop PostgreSQL → API error → start lagi
10. [ ] Nilai plus:
        - [ ] `dnsmasq` → `lms.local`
        - [ ] Nginx `proxy_cache` → header `X-Cache-Status`
        - [ ] Clone VM kedua + Nginx round-robin (load balancing)
11. [ ] Tulis Bab VI sub-bab SOBJ + Bab II (SO, jaringan, TCP/IP, systemd)

**Bukti minimum:** 8 screenshot + diagram + config Nginx/systemd + log.

**Estimasi:** 1–2 hari.

---

### 4.4 TKTI (Tata Kelola Teknologi Informasi)

**Artefak yang diklaim:** Penerapan tata kelola TI pada pengelolaan LMS sekolah —
kebijakan, manajemen risiko, audit, dan keterlibatan stakeholder.

**Pekerjaan:**
1. [ ] **Diskusi stakeholder** (wajib, ikuti pola senior):
       - Jadwalkan dengan kepala sekolah / wakil kurikulum / guru
       - Bahas: kebutuhan LMS, akses, data siswa, backup
       - **Foto dokumentasi** ← bukti utama seperti Gambar 6.5 senior
       - Catat hasil: kebutuhan fungsional & non-fungsional
2. [ ] Susun **Risk Register** (`docs/tkti/risk-register.md`):
       - Risiko: data siswa bocor, server down, akun admin disalahgunakan,
         kehilangan data, perubahan tanpa persetujuan
       - Kolom: risiko, likelihood, impact, skor, mitigasi, owner
3. [ ] Susun **Kebijakan TI** (`docs/tkti/it-policy.md`):
       - Password & akses, sesi, backup, data pribadi siswa, perubahan
4. [ ] Susun **RACI Matrix** (`docs/tkti/raci.md`):
       - Proses: tambah LMS, backup, insiden, perubahan
       - Peran: Kepala Sekolah, Admin, Guru, Operator
5. [ ] Susun **SOP Operasional** (`docs/tkti/sop.md`):
       - Deploy, rollback, restore backup, tambah pengguna
6. [ ] Susun **Incident & Change Management** (`docs/tkti/incident-change.md`):
       - Alur lapor → klasifikasi → respons → tutup + SLA
7. [ ] Ambil bukti teknis:
       - [ ] Screenshot tabel `AuditLog` (siapa, aksi, IP, waktu)
       - [ ] Screenshot fitur backup JSON
       - [ ] Screenshot Git history (bukti change management)
       - [ ] Screenshot GitHub Actions (bukti kontrol perubahan)
8. [ ] Susun **KPI**: uptime, response time, jumlah LMS aktif
9. [ ] Tulis Bab VI sub-bab TKTI + Bab II (COBIT/ISO 38500/ITIL)

**Bukti minimum:** foto diskusi + risk register + kebijakan + screenshot audit log.

**Estimasi:** 2–3 hari (tergantung jadwal stakeholder).

---

### 4.5 Keamanan Jaringan Komputer

**Artefak yang diklaim:** Implementasi dan pengujian keamanan pada portal dan API.

**Pekerjaan Tahap A — Perbaikan (wajib sebelum uji):**
1. [ ] Perbaiki XSS `href` di `assets/portal.js:338` (escape + validasi URL ketat)
2. [ ] Hapus/kunci fallback auth localStorage di `portal.js`
3. [ ] Pastikan `.env` tidak masuk repo (sudah di `.gitignore`)
4. [ ] Tambah security headers di Netlify (`netlify.toml`) dan Nginx (sudah ada)

**Pekerjaan Tahap B — Implementasi (sudah ada, verifikasi):**
5. [ ] Argon2id hashing — `api/src/routes/auth.js:66`
6. [ ] JWT HttpOnly + Secure + SameSite=Strict — `auth.js:29-36`
7. [ ] Rate limit login 5/menit, API 100/menit — `api/src/index.js:47-49`
8. [ ] CSP, HSTS, X-Frame-Options — `index.js:22-37` + `portal-nginx.conf`
9. [ ] Validasi Zod semua endpoint
10. [ ] Audit log + CORS allowlist

**Pekerjaan Tahap C — Pengujian (hanya pada server sendiri):**
11. [ ] OWASP ZAP baseline scan → simpan report HTML
       ```bash
       docker run -t ghcr.io/zaproxy/zaproxy:stable \
         zap-baseline.py -t https://<domain> -r zap-report.html
       ```
12. [ ] SSL Labs scan (ssllabs.com/ssltest) → screenshot grade
13. [ ] securityheaders.com → screenshot grade
14. [ ] `nmap -sV -p- <domain>` → bukti hanya port 22/80/443 terbuka
15. [ ] `nikto -h https://<domain>` → report
16. [ ] Uji brute force:
        ```bash
        for i in {1..10}; do
          curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<domain>/api/auth/login \
            -H "Content-Type: application/json" \
            -d '{"username":"admin","password":"salah"}'
        done
        ```
        → percobaan ke-6 harus `429`
17. [ ] Uji XSS: isi form dengan `<script>alert(1)</script>` → ter-escape
18. [ ] Uji SQLi: payload `' OR '1'='1` → ditolak (Prisma parameterized)
19. [ ] Uji clickjacking: `<iframe src="...">` → diblokir
20. [ ] Uji HTTP → HTTPS redirect (301)
21. [ ] (Nilai plus) fail2ban + SSH key-only auth + `ufw` — screenshot

**Pekerjaan Tahap D — Dokumentasi:**
22. [ ] Tabel temuan: Temuan | Severity | CVSS | Bukti | Mitigasi | Status
23. [ ] Screenshot hash Argon2 di database (`$argon2id$...`)
24. [ ] Screenshot cookie HttpOnly di DevTools
25. [ ] Tulis Bab VI sub-bab Keamanan Jaringan + Bab II (TLS, JWT, hash, firewall)

**Bukti minimum:** ZAP report + SSL Labs + securityheaders + 5 uji manual + screenshot DB.

**Estimasi:** 2 hari.

---

## 5. Timeline Pelaksanaan

| Hari | Kegiatan | MK Terkait |
|------|----------|------------|
| **Hari 1** | Fix celah (XSS href, auth fallback), rapikan halaman mapel rusak | Website, NetSec |
| **Hari 2** | Deploy Netlify + Lighthouse + screenshot portal | Website |
| **Hari 3** | Install VirtualBox + Ubuntu Server + SSH | SOBJ |
| **Hari 4** | Deploy stack di Ubuntu (Nginx, API, PostgreSQL, systemd, UFW) | SOBJ |
| **Hari 5** | Ambil bukti SOBJ (diagram, log, uji offline, uji fault) | SOBJ |
| **Hari 6** | Jalankan scan keamanan (ZAP, nmap, nikto, SSL Labs, headers) | NetSec |
| **Hari 7** | Uji manual keamanan + screenshot bukti + perbaikan temuan | NetSec |
| **Hari 8–10** | Flutter app (WebView → APK → screenshot → video) | Mobile |
| **Hari 11** | Diskusi stakeholder + foto dokumentasi | TKTI |
| **Hari 12** | Susun risk register, kebijakan, RACI, SOP, incident/change | TKTI |
| **Hari 13** | Ambil bukti audit log, backup, Git history | TKTI |
| **Hari 14** | Susun Bab VI lengkap + Bab II + Bab V (use case, screenshot) | Semua |
| **Hari 15** | Review akhir, format laporan, lampiran | Semua |

> Total ±15 hari kerja efektif (±3 minggu kalender).

---

## 6. Definition of Done per Mata Kuliah

### Website
- [ ] Portal live di Netlify (URL publik)
- [ ] Lighthouse ≥ 90 di 4 kategori
- [ ] 5 screenshot UI
- [ ] 3 potongan kode
- [ ] Sub-bab Bab VI selesai

### Mobile
- [ ] APK release terbuild
- [ ] Berjalan di HP/emulator (screenshot)
- [ ] Video demo
- [ ] Potongan `main.dart`
- [ ] Sub-bab Bab VI selesai

### SOBJ
- [ ] Ubuntu Server berjalan di VirtualBox (Bridged)
- [ ] Portal + API + DB aktif sebagai service
- [ ] Diagram arsitektur + 8 screenshot bukti
- [ ] Uji offline & uji fault terdokumentasi
- [ ] Sub-bab Bab VI selesai

### TKTI
- [ ] Foto diskusi stakeholder
- [ ] Risk register + kebijakan + RACI + SOP
- [ ] Screenshot audit log + backup
- [ ] Sub-bab Bab VI selesai

### Keamanan Jaringan
- [ ] 2 celah diperbaiki (XSS href, auth fallback)
- [ ] ZAP + SSL Labs + securityheaders + nmap + nikto
- [ ] 5 uji manual dengan hasil
- [ ] Tabel temuan + mitigasi
- [ ] Sub-bab Bab VI selesai

---

## 7. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| VirtualBox Bridged gagal di Wi-Fi kampus | SOBJ terhambat | Gunakan NAT + port forwarding (2222/8080) |
| Stakeholder tidak bisa ditemui | Bukti TKTI kurang | Maksimalkan dokumen + screenshot audit; jadwalkan lebih awal |
| Waktu habis sebelum Mobile selesai | MK Mobile tidak terkonversi | Prioritaskan WebView wrapper (1–2 hari), native port opsional |
| Scan keamanan menemukan banyak celah | Laporan terlihat buruk | Perbaiki dulu sebelum scan final; lampirkan scan sebelum & sesudah |
| IP VM berubah saat reboot | Akses terputus | Set static IP via netplan |
| Data mapel kosong (14 file) | Portal terlihat rusak | Buat data minimal atau sembunyikan dari registry |

---

## 8. Struktur Laporan (mengikuti format senior)

```
BAB I    Pendahuluan
BAB II   Tinjauan Pustaka
         → definisikan SEMUA teknologi: HTML, CSS, JS, PWA, Service Worker,
           Nginx, Ubuntu, VirtualBox, Docker, PostgreSQL, Prisma, Express,
           JWT, Argon2, Flutter, Dart, WebView, dll.
BAB III  Metode Pelaksanaan
BAB IV   Gambaran Umum Lokasi (SMAN 4 Ternate)
BAB V    Hasil dan Pembahasan
         → use case diagram, analisis kebutuhan, screenshot UI portal
BAB VI   Konversi Kegiatan MBKM pada Mata Kuliah
         6.1 Daftar Mata Kuliah (tabel kode, SKS, jenis)
         6.2.1 Website
         6.2.2 Mobile
         6.2.3 SOBJ
         6.2.4 TKTI
         6.2.5 Keamanan Jaringan
BAB VII  Penutup
```

**Pola tiap sub-bab 6.2.x:**
> "Untuk mata kuliah **X**, kami melakukan **Y** (aktivitas nyata), yang berkaitan
> dengan **Z** (konsep mata kuliah). Berikut Gambar **N** dapat dilihat **bukti**."

---

## 9. Checklist Bukti Global

| Jenis | Bukti | Digunakan untuk |
|-------|-------|-----------------|
| URL | Netlify live | Website |
| Screenshot | Portal desktop/mobile, kelola, pantau, dark mode | Website |
| Screenshot | Lighthouse | Website |
| APK | File release | Mobile |
| Screenshot | Aplikasi di HP + video | Mobile |
| Diagram | Arsitektur client-server | SOBJ |
| Screenshot | SSH, systemctl, ufw, log, ip a | SOBJ |
| Screenshot | Uji offline & fault | SOBJ |
| Foto | Diskusi stakeholder | TKTI |
| Dokumen | Risk register, kebijakan, RACI, SOP | TKTI |
| Screenshot | AuditLog, backup, Git history | TKTI |
| Report | ZAP, Nikto, SSL Labs, securityheaders | NetSec |
| Screenshot | DB hash, cookie HttpOnly, 429, redirect HTTPS | NetSec |

---

*Dokumen ini adalah panduan kerja. Perbarui status checklist seiring progres.*
