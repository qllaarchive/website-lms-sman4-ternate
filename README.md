# LMS SMA Negeri 4 Ternate

Portal LMS (Learning Management System) SMA Negeri 4 Ternate — daftar LMS per mata pelajaran kelas X, XI, XII.

## Struktur Repo
```
├── portal/ (root)    → Website statis (HTML/JS/CSS), deploy via Nginx
├── api/               → Backend (Node + Express + Prisma + PostgreSQL)
├── mobile/            → Flutter app (dalam pengerjaan)
├── docs/              → Laporan per mata kuliah
├── docker-compose.yml → Local dev: api + db + portal
└── .github/workflows  → CI/CD ke VPS
```

## Quick Start (Local)
```bash
# 1. Start db + api + portal
docker compose up -d

# 2. Jalankan migrasi
cd api && npx prisma migrate dev

# 3. Buka portal
open http://localhost:8080
```

## Mata Kuliah Terkait
- Website — Frontend SPA + PWA + Nginx + security headers
- Mobile — Flutter app (offline-first)
- SOBJ — Client-server sync, caching, distributed locking
- TKTI — Governance docs, risk register, audit trail
- Keamanan Jaringan — JWT, Argon2, CSP, rate limit, penetration test

## License
MIT