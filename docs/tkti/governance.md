# Laporan TKTI (Tata Kelola TI) — LMS SMA N 4 Ternate

**Mahasiswa:** [NAMA]  
**NIM:** [NIM]  
**Tanggal:** [TANGGAL]

---

## 1. Kebijakan Keamanan Informasi

### 1.1 Kebijakan Kata Sandi
- Minimal 8 karakter
- Wajib kombinasi huruf + angka + simbol
- Hash dengan Argon2id (memory-hard)
- Rotasi: setiap 90 hari untuk akun admin

### 1.2 Kebijakan Akses
- Hanya 1 akun admin aktif (first-user registration)
- Session berlaku 7 hari (JWT expiry)
- Cookie HttpOnly + Secure + SameSite=Strict
- Rate limit: 5 percobaan login/menit

### 1.3 Kebijakan Backup
- Database: backup harian via pg_dump
- Frontend: backup via Git (GitHub)
- Cadangan manual: fitur "Cadangkan JSON" di portal
- Retensi: 30 hari

---

## 2. Manajemen Risiko

| Risiko | Kemungkinan | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Data siswa bocor | Sedang | Tinggi | HTTPS, JWT, rate limit |
| Website dimodifikasi | Rendah | Sedang | Git version control, deploy via CI/CD |
| Server down | Sedang | Tinggi | Docker Compose restart, uptime monitoring |
| Password admin bocor | Rendah | Tinggi | Argon2id, rate limit, audit log |
| Serangan XSS/SQLi | Rendah | Tinggi | esc(), parameterized query, CSP |
| Kehilangan data | Rendah | Tinggi | Backup harian + cadangan manual |

---

## 3. Audit Trail

Tabel `AuditLog` mencatat:
- `userId` — siapa yang melakukan
- `action` — HTTP method + path
- `ip` — alamat IP pelaku
- `userAgent` — browser/perangkat
- `detail` — status code + response time
- `createdAt` — timestamp

Contoh log:
```
admin | POST /api/lms | 192.168.1.100 | Chrome/120 | {status:201, ms:45} | 2026-10-21 12:30:00
admin | DELETE /api/lms/abc123 | 192.168.1.100 | Chrome/120 | {status:200, ms:12} | 2026-10-21 12:31:00
```

---

## 4. Inventaris Aset TI

| Aset | Lokasi | Owner | Status |
|------|--------|-------|--------|
| Domain | sman4.sch.id | Admin | Aktif |
| VPS (Ubuntu) | [IP] | Admin | Aktif |
| GitHub Repo | qllaarchive/website-lms-sman4-ternate | Admin | Aktif |
| Database | PostgreSQL 16 (Docker) | Admin | Aktif |
| Google Drive | Folder spreadsheet guru | Guru | Aktif |
| Apps Script | LMS Matematika X | Guru | Aktif |

---

## 5. SLA (Service Level Agreement)

| Layanan | Target Uptime | Response Time |
|---------|---------------|---------------|
| Portal LMS | 99.5% | < 2 detik |
| API Backend | 99.0% | < 500ms |
| Login | 99.9% | < 1 detik |

---

## 6. Runbook Operasional

### Deploy Update
```bash
ssh user@vps
cd /opt/lms
git pull origin main
docker compose up -d --build
```

### Rollback
```bash
cd /opt/lms
git checkout <commit-hash>
docker compose up -d --build
```

### Restore Backup Database
```bash
docker exec -i lms-db psql -U lms -d lms < backup.sql
```

### Cek Status
```bash
docker compose ps
docker compose logs api --tail=50
curl -s http://localhost:3000/health
```

---

## 7. Kesimpulan

Sistem LMS ini menerapkan prinsip tata kelola TI:
- **Confidentiality** — HTTPS, JWT, HttpOnly cookie, Argon2
- **Integrity** — Git version control, audit log, input validation
- **Availability** — Docker Compose, PWA offline mode, backup

Rekomendasi: implementasi monitoring (UptimeRobot/Prometheus) dan
penetration test terjadwal setiap semester.