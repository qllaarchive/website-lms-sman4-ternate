# Laporan SOBJ (Sistem Operasi Berbasis Jaringan) — LMS SMA N 4 Ternate

**Mahasiswa:** [NAMA]  
**NIM:** [NIM]  
**Tanggal:** [TANGGAL]

---

## 1. Arsitektur Client-Server

```
┌─────────────────────────────────────────────────────┐
│                    INTERNET                          │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (443)
                ┌──────▼──────┐
                │    Nginx    │  ← Reverse proxy + TLS termination
                │  (portal)   │  ← Serve static files (HTML/CSS/JS)
                └──────┬──────┘
                       │ proxy_pass (3000)
                ┌──────▼──────┐
                │  Node.js    │  ← REST API + JWT auth
                │  (Express)  │  ← Rate limiting + audit
                └──────┬──────┘
                       │ TCP (5432)
                ┌──────▼──────┐
                │ PostgreSQL  │  ← Persistent storage
                └─────────────┘
```

---

## 2. Sinkronisasi Data

### 2.1 Strategi: Last-Write-Wins (LWW)
- Client menyimpan progres di localStorage (offline)
- Saat online, client POST ke `/api/progress`
- Server simpan timestamp → data terbaru menang

### 2.2 Conflict Resolution
```javascript
// Client kirim:
{ lmsId: "matematika", pct: 85, source: "device-abc" }

// Server compare dengan data existing:
if (newData.at > existing.at) {
  update(existing, newData); // LWW
} else {
  ignore(newData); // data lama
}
```

### 2.3 Offline-First (Service Worker)
```javascript
// sw.js — stale-while-revalidate
caches.match(request).then(hit => {
  return hit || fetch(request).then(res => {
    caches.open(CACHE).then(c => c.put(request, res.clone()));
    return res;
  }).catch(() => caches.match("index.html")); // fallback offline
});
```

---

## 3. Distributed Locking

### Optimistic Locking (untuk edit LMS bersamaan)
```sql
-- Tabel LMS punya kolom version
ALTER TABLE lms_entry ADD COLUMN version INTEGER DEFAULT 1;

-- Update hanya jika version sama
UPDATE lms_entry SET name='x', version=version+1
WHERE id='abc' AND version=3;
-- Jika 0 rows affected → conflict → client refresh
```

---

## 4. Fault Tolerance

### Retry + Exponential Backoff
```javascript
async function fetchWithRetry(url, opts, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, opts);
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * 2 ** i)); // 1s, 2s, 4s
    }
  }
}
```

### Circuit Breaker (untuk API Google Sheets)
- Jika 5 request gagal berturut-turut → circuit OPEN (skip 30 detik)
- Setelah 30 detik → HALF-OPEN (coba 1 request)
- Jika berhasil → CLOSED (normal)

---

## 5. Monitoring

| Metrik | Tool | Threshold |
|--------|------|-----------|
| Request latency | Prometheus + Grafana | P95 < 500ms |
| Error rate | Prometheus | < 1% |
| Uptime | UptimeRobot | 99.5% |
| Disk usage | node_exporter | < 80% |
| Memory usage | node_exporter | < 85% |
| DB connections | postgres_exporter | < 80% pool |

---

## 6. Pengujian Partisi Jaringan

| Skenario | Hasil | Catatan |
|----------|-------|---------|
| Internet mati → PWA offline | ✅ Cache tersedia | SW fallback ke index.html |
| Internet pulih → sync | ✅ Progres terkirim | fetchWithRetry berhasil |
| API down → portal | ✅ Portal tetap jalan | Static files tetap diserve |
| DB down → API | ❌ Error 500 | Perlu graceful degradation |

---

## 7. Kesimpulan
- Arsitektur client-server terpisah (portal ↔ API ↔ DB)
- Offline-first dengan Service Worker
- Sinkronisasi menggunakan Last-Write-Wins
- Fault tolerance dengan retry + exponential backoff
- Monitoring dengan Prometheus + Grafana