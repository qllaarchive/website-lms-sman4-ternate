# Rencana Implementasi & Konversi Mata Kuliah (Magang Semester 5)
Portal LMS SMA Negeri 4 Ternate

Rencana ini disusun untuk memenuhi syarat konversi 5 Mata Kuliah Teknik Informatika Semester 5 melalui proyek magang: **Website, Mobile, Sistem Operasi Berbasis Jaringan (SOBJ), Tata Kelola TI (TKTI), dan Keamanan Jaringan**.

---

## FASE 0 — Perbaikan Wajib (Security & Integrity)
*Target: Menutup celah keamanan dasar dan merapikan struktur kode.*

1.  **Mata Kuliah: Website & Keamanan Jaringan**
    *   **Aksi:** Perbaikan celah XSS pada `href` dan input di `assets/portal.js`.
    *   **Aksi:** Penghapusan *auth fallback* (pintu belakang admin) di `localStorage`.
    *   **Aksi:** Pembuatan `netlify.toml` untuk *Security Headers* (CSP, HSTS, X-Frame-Options).
2.  **Mata Kuliah: Tata Kelola TI**
    *   **Aksi:** Merapikan `registry.js` dan menghapus halaman mapel yang rusak agar sistem memiliki integritas data yang baik.

---

## FASE 1 — Deploy Website (Mata Kuliah: Website)
*Target: Aplikasi tersedia secara publik melalui HTTPS.*

1.  **Deployment:** Hubungkan repositori ke **Netlify**.
2.  **Verifikasi:** 
    *   Portal dapat diakses via HTTPS.
    *   Fungsi CRUD (Tambah/Edit/Hapus) LMS berjalan normal melalui API Render.
    *   Lighthouse Audit (Performance & Accessibility) skor ≥ 90.

---

## FASE 2 — Server Ubuntu (Mata Kuliah: SOBJ)
*Target: Simulasi infrastruktur jaringan server profesional.*

1.  **Virtualisasi:** Install Ubuntu Server 24.04 di **VirtualBox / UTM**.
2.  **Konfigurasi Jaringan:** Setup IP Statis, SSH, dan Firewall (UFW).
3.  **Deployment Stack:** Install Nginx, Node.js, dan PostgreSQL di server.
4.  **Reverse Proxy:** Konfigurasi Nginx untuk memproksi `/api/` ke port 3000.
5.  **Ketahanan Sistem:** Mengelola API menggunakan **systemd service** agar otomatis menyala saat server *restart*.

---

## FASE 3 — Mobile App (Mata Kuliah: Mobile)
*Target: Aksesibilitas portal melalui perangkat smartphone.*

1.  **Framework:** Menggunakan **Flutter** dengan `webview_flutter`.
2.  **Implementasi:** Membungkus portal responsif ke dalam aplikasi Android (.apk) dan iOS.
3.  **Distribusi & Testing:** Melakukan *Usability Testing* pada sampel siswa/teman menggunakan file APK hasil build.

---

## FASE 4 — Tata Kelola TI (Mata Kuliah: TKTI)
*Target: Penerapan framework tata kelola standar industri.*

1.  **Framework:** Menggunakan **COBIT 2019** (fase *tailoring* fokus pada domain DSS05 & APO12).
2.  **Dokumentasi:** Pembuatan matriks **RACI** untuk pembagian wewenang (Admin, Guru, IT).
3.  **Manajemen Risiko:** Dokumentasi rencana cadangan (*Backup/Restore*) dan audit log aktivitas admin di database.
4.  **Stakeholder:** Diskusi kebutuhan sistem dengan pihak sekolah (Kurikulum).

---

## FASE 5 — Keamanan Jaringan (Mata Kuliah: Kemjar)
*Target: Pengujian dan hardening sistem dari serangan luar.*

1.  **SSL/TLS:** Mengamankan API menggunakan HTTPS (Cloudflare Tunnel / Certbot).
2.  **Vulnerability Scanning:** Melakukan scan menggunakan **ZAP Baseline Scan** atau **Nikto**.
3.  **Network Auditing:** Melakukan *port scanning* menggunakan **Nmap** untuk memastikan hanya port minimal yang terbuka (22, 80, 443).
4.  **Mitigasi Serangan:** Simulasi dan penanganan *Rate Limiting* (Brute Force) serta sanitasi input (XSS/SQLi).

---

## Urutan Eksekusi
- **Hari 1:** FASE 0 & FASE 1 (Website & Dasar Keamanan)
- **Hari 2-3:** FASE 2 (SOBJ / Server Ubuntu)
- **Hari 4-5:** FASE 3 (Mobile / Flutter Build)
- **Hari 6:** FASE 4 (TKTI / Dokumen & Audit)
- **Hari 7:** FASE 5 (Kemjar / Scan & Hardening)
