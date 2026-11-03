# Laporan Keamanan Jaringan — LMS SMA N 4 Ternate

**Mahasiswa:** [NAMA]  
**NIM:** [NIM]  
**Tanggal audit:** 3 November 2026

**Snapshot:** `main` @ `e7d4daf` + perubahan hardening lokal
**Lingkup:** portal statis, API Express/Render, API serverless/Vercel, autentikasi admin, CRUD LMS, unggah slider, header keamanan, dependensi, dan sesi pengguna.

> Laporan ini adalah audit white-box dan uji lokal. Pengujian tidak diarahkan ke database produksi dan tidak melakukan perubahan data produksi.

## 1. Ringkasan Eksekutif

Portal sudah memiliki kontrol penting: password Argon2id, JWT di cookie `HttpOnly`, CSRF token, validasi URL/link, escaping output, CORS allowlist, rate limit login di backend Express, serta security header pada deployment statis. Pengujian XSS, query injection, CSRF, akses tanpa login, dan path traversal tidak menemukan bypass pada jalur yang diuji.

Namun masih ada risiko yang harus ditutup sebelum dinyatakan aman untuk produksi:

1. **Kredensial Neon asli pernah ikut ter-commit** di `.env.example`. File sudah disanitasi, tetapi nilai lama masih ada di riwayat Git dan harus dianggap bocor.
2. **Backend serverless belum memiliki rate limit login** dan belum memiliki audit log.
3. **Dependensi Next.js/NextAuth memiliki advisory kritis** pada `npm audit`. Risiko ini langsung berlaku bila deployment Vercel/Next dijalankan; deployment Netlify statis tidak menjalankan runtime Next.
4. **JWT bersifat stateless tanpa revocation**; logout hanya menghapus cookie di browser, token yang sudah dicuri tetap valid sampai kedaluwarsa.
5. **CSP masih memakai `unsafe-inline`** karena halaman mapel memakai script inline.
6. **Integritas skor/progres siswa masih dapat dimanipulasi** melalui `localStorage`.

## 2. Metodologi

- Review kode white-box pada `api/`, `public/assets/`, `netlify.toml`, `vercel.json`, dan skema Prisma.
- Uji HTTP dengan `curl`: autentikasi, otorisasi, CSRF, validasi input, CORS, cookie, rate limit, dan path traversal.
- Uji browser dengan Chromium/Puppeteer pada lebar 320, 360, 390, 414, dan 640 px.
- Uji fungsional memakai PostgreSQL sementara di `127.0.0.1:55432`, admin test lokal, dan API lokal; bukan database Neon produksi.
- Pemeriksaan dependensi dengan `npm audit --omit=dev` pada root dan `api/`.
- Tidak dilakukan pemindaian OWASP ZAP pada laporan ini karena tidak tersedia dalam lingkungan uji; klaim scan ZAP pada versi laporan sebelumnya tidak dipertahankan.

## 3. Temuan

| ID | Temuan | Severity | Bukti | Status |
|---|---|---|---|---|
| SEC-01 | Kredensial database Neon asli ada di `.env.example` yang tracked | Kritis | `git show 08c3310:.env.example` masih memuat connection string; file sekarang sudah disanitasi | **Terbuka — rotasi credential dan bersihkan riwayat Git** |
| SEC-02 | Dependensi `next` dan `next-auth` memiliki advisory kritis/high | Kritis | `npm audit` root: 2 critical, 1 high | **Terbuka bila Vercel/Next runtime dipakai; Netlify statis tidak menjalankan Next** |
| SEC-03 | Login serverless tidak memiliki rate limit | Tinggi | `api/index.js` tidak memakai limiter; hanya Express yang memakai `express-rate-limit` | **Terbuka** |
| SEC-04 | Tidak ada audit log perubahan data admin | Sedang | Tidak ditemukan model/middleware audit di `api/src` maupun `prisma/schema.prisma` | **Terbuka** |
| SEC-05 | JWT tidak dapat dicabut sebelum expiry | Sedang | Token 30 hari, logout hanya mengirim cookie kosong; tidak ada session version/revocation list | **Terbuka / diterima sebagai trade-off** |
| SEC-06 | CSP masih `script-src 'unsafe-inline'` | Sedang | `netlify.toml`, `portal-nginx.conf` | **Terbuka** |
| SEC-07 | Drift backend: serverless menyimpan slider sebagai base64 di database; Express memakai storage/R2 | Sedang | `api/index.js` `sliderWrite()` vs `api/src/routes/sliders.js` | **Terbuka** |
| SEC-08 | Skor/progres siswa dapat diubah lewat `localStorage` | Sedang | `public/assets/lms.js` menyimpan progres di perangkat | **Diterima — bukan kontrol autentikasi; perlu validasi server bila skor dinilai** |
| SEC-09 | Rate limit Express disimpan di memori proses | Rendah | Limiter reset saat restart dan tidak terbagi antar-instance | **Diterima untuk single instance; gunakan Redis untuk multi-instance** |
| SEC-10 | `vercel.json` build menjalankan `prisma db push` | Tinggi (operasional) | `package.json` root: `prisma generate && prisma db push --skip-generate && next build` | **Terbuka — jangan arahkan build ke DB produksi** |
| SEC-11 | Cookie memakai `SameSite=Lax`, bukan `Strict` | Rendah | `api/src/session.js` default `lax` | **Diterima — CSRF header tetap wajib untuk request perubahan** |
| SEC-12 | Refresh token diperpanjang setiap `/auth/me` | Rendah | Sesi aktif dapat terus diperpanjang hingga admin logout | **Diterima — sliding 30 hari untuk kenyamanan admin** |

## 4. Kontrol yang Sudah Diuji

| Kontrol | Hasil |
|---|---|
| Password hash | Argon2id; dummy hash dipakai untuk username tidak ada agar waktu respons tidak membocorkan akun |
| Cookie sesi | `HttpOnly`, `SameSite=Lax`, `Secure` otomatis saat HTTPS; `Max-Age=2592000` (30 hari) |
| Auto-login | Reload halaman memulihkan admin melalui `/auth/me`; cookie diperpanjang dan token dirotasi |
| Logout | Cookie dihapus; `/auth/me` mengembalikan `user:null`; reload tidak lagi admin |
| CSRF | Login menghasilkan token; `/me` mempertahankan token yang sama; POST tanpa token / token salah ditolak `403` |
| Validasi query | `?klass[$ne]=X` dan `?klass=IX` ditolak `400` |
| Validasi link | `javascript:`, `data:`, protocol-relative, traversal, dan kutip ditolak `400` |
| Akses anonim | POST/PUT/DELETE dan endpoint `/all` ditolak `401` |
| Duplikat ID | `409 duplicate_id` |
| Path traversal upload | `404` atau `403 forbidden`; tidak ada file server yang terbaca |
| CORS | Origin yang diizinkan mendapat `Access-Control-Allow-Origin`; origin asing tidak mendapat header izin |
| XSS tersimpan | Payload `<img src=x onerror=...>` tampil sebagai teks; `window.__xss` tetap `false`; tidak ada elemen `img[src=x]` |
| Rate limit login | Percobaan gagal ke-10 menghasilkan `429`, `Retry-After` aktif; window 15 menit |
| Security header API | Helmet aktif; `X-Content-Type-Options`, `X-Frame-Options`, HSTS, dan `Cache-Control: no-store` pada auth |
| Security header statis | Dikonfigurasi di `netlify.toml` dan `portal-nginx.conf`; perlu diverifikasi pada domain produksi |
| Dependensi API | `npm audit --omit=dev` API: 0 vulnerability setelah Zod diperbarui ke 4.6.7 |
| Dependensi root | `npm audit` root: 2 critical, 1 high, 1 moderate; terutama `next`/`next-auth` |

## 5. Hasil Uji Fungsional dan Performa

### 5.1 Layout mobile

Diuji pada 320, 360, 390, 414, dan 640 px:

- `.page-switch` menjadi `position:static` pada `<=640px`.
- Tidak ada overlap dengan tombol kembali.
- Tidak ada horizontal overflow pada halaman maupun modal kelola.
- Ketiga tab (`Kelola LMS`, `Kelola Foto`, `Spreadsheet`) tetap terlihat dan dapat dipilih.
- Tombol “Tambah LMS” dan daftar LMS tetap dapat digunakan pada 320 px.

### 5.2 Simpan ganda

Dua `requestSubmit()` sinkron pada form LMS menghasilkan **satu** request `POST /api/lms` dan **satu** baris data. Tombol simpan kembali aktif setelah respons, dan data uji berhasil dihapus.

### 5.3 Gambar dan loading

- Intro mobile memakai AVIF 800 px: sekitar **65 KB**, dibanding WebP lama sekitar **199 KB**.
- Intro desktop memakai AVIF responsif: 1400 px sekitar **98 KB**, 1600 px sekitar **129 KB**, atau 2200 px sekitar **225 KB**, dibanding WebP lama sekitar **360 KB**.
- Pengguna yang sudah pernah membuka intro tidak mengunduh gambar intro lagi (0 request).
- Gambar login memakai `loading="lazy"` dan tidak diunduh pada halaman utama sebelum modal login dibuka.
- Logo tampilan memakai WebP sekitar **6 KB**; PNG 180 px sekitar **61 KB** hanya untuk favicon/apple touch icon.
- Slider yang diunggah sekarang diperkecil ke WebP di browser (sisi terpanjang 1920 px, kualitas 0,82; fallback ke file asli bila browser tidak mendukung).

## 6. Rekomendasi Prioritas

### P0 — sebelum produksi

1. **Rotasi password/kredensial Neon sekarang.** Sanitasi `.env.example` tidak menghapus nilai dari riwayat Git.
2. Bersihkan riwayat dengan `git filter-repo`/BFG, koordinasikan force-push, lalu aktifkan secret scanning dan pre-commit hook.
3. Tambahkan rate limit pada serverless (Redis/Upstash atau Vercel Firewall) atau satukan backend agar hanya satu jalur auth yang aktif.
4. Jangan biarkan build Vercel menjalankan `prisma db push` ke database produksi; gunakan migrasi terkontrol.
5. Bila Vercel/Next tetap dipakai, upgrade `next`/`next-auth` ke versi yang tidak terdampak atau hapus dependensi Next yang tidak diperlukan.

### P1 — hardening

1. Tambahkan audit log untuk login, logout, create/update/delete LMS, upload slider, dan perubahan profil.
2. Tambahkan revocation sesi: `sessionVersion` per user atau session table, dan naikkan versi saat logout/password berubah.
3. Ganti CSP `unsafe-inline` dengan nonce/hash; pindahkan script inline halaman mapel ke file eksternal.
4. Tambahkan validasi magic bytes pada upload gambar; jangan hanya percaya `Content-Type`.
5. Samakan perilaku upload Express/serverless dan pindahkan base64 slider serverless ke object storage.
6. Validasi skor/progres di server bila skor dipakai untuk penilaian.

### P2 — operasional

1. WAF/IDS (Cloudflare/Suricata) dan pemantauan login gagal.
2. Backup database terjadwal dan uji restore.
3. Vulnerability scanning terjadwal dan review dependensi otomatis.
4. Verifikasi header produksi dengan `curl -I` pada domain Netlify/Render yang sebenarnya.

## 7. Kesimpulan

Perbaikan utama sudah meningkatkan postur keamanan: autentikasi tidak lagi disimpan di client, cookie sesi persisten dan `HttpOnly`, CSRF dilindungi header, input LMS divalidasi, XSS output di-escape, dan akses anonim ditolak. Uji lokal tidak menemukan bypass pada jalur yang diperiksa.

Namun aplikasi **belum dapat dinyatakan sepenuhnya aman** karena kebocoran kredensial di riwayat Git, belum adanya rate limit serverless/audit log, dan advisory dependensi Next.js/NextAuth. Temuan P0 harus diselesaikan sebelum deployment produksi berikutnya.
