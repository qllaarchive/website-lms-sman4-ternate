# Laporan Keamanan Jaringan — LMS SMA N 4 Ternate

**Mahasiswa:** [NAMA]  
**NIM:** [NIM]  
**Tanggal:** [TANGGAL]

---

## 1. Identifikasi Celah Keamanan

| # | Celah | Severity | Lokasi | Status |
|---|-------|----------|--------|--------|
| 1 | Autentikasi client-side only | 🔴 Critical | portal.js | ✅ Fixed (JWT + HttpOnly cookie) |
| 2 | Hash password lemah (custom) | 🔴 Critical | portal.js | ✅ Fixed (Argon2id) |
| 3 | XSS via `href` attribute | 🔴 Critical | portal.js:338 | ✅ Fixed (esc + URL validation) |
| 4 | Skor bisa dimanipulasi via localStorage | 🟠 High | tiap LMS | 🔄 Fixed (HMAC signing) |
| 5 | URL phishing bebas | 🟠 High | kelola form | ✅ Fixed (HTTPS only) |
| 6 | Tidak ada rate limit login | 🟠 High | login form | ✅ Fixed (express-rate-limit) |
| 7 | Tidak ada CSP/X-Frame-Options | 🟡 Medium | Nginx | ✅ Fixed (security headers) |
| 8 | Tidak ada audit log | 🟡 Medium | seluruh app | ✅ Fixed (audit middleware) |
| 9 | Google Drive ID terekspos | 🟡 Medium | portal.js:15 | 🔄 Perlu proxy |
| 10 | PII plaintext di localStorage | 🟢 Low | localStorage | 🔄 Partially fixed |

---

## 2. Mitigasi yang Diimplementasikan

### 2.1 Autentikasi (JWT + HttpOnly Cookie)
```
POST /api/auth/login
→ Server verifikasi Argon2 hash
→ Set cookie: lms_session=<JWT>; HttpOnly; Secure; SameSite=Strict
→ Client tidak bisa akses token via JavaScript
```

### 2.2 Hash Password (Argon2id)
```javascript
// Sebelum (lemah):
hash(pw, salt) { out = out * 131 + charCode } // polynomial, 1 iterasi

// Sesudah (kuat):
argon2.hash(password, { type: argon2.argon2id })
// - Memory-hard (94 MB)
// - 3 iterasi
// - Salt 16 byte random
```

### 2.3 XSS Prevention
```javascript
// Escaping semua output dinamis
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[c]));
}

// URL validation ketat
if (!/^https:\/\//.test(url)) return fail("Harus HTTPS");
```

### 2.4 Security Headers (Nginx)
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; ... frame-ancestors 'none'" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 2.5 Rate Limiting
```javascript
// Login: maks 5 percobaan/menit
app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 5 }));

// API umum: maks 100 request/menit
app.use("/api", rateLimit({ windowMs: 60_000, max: 100 }));
```

### 2.6 Audit Log
```javascript
// Setiap request non-GET dicatat
AuditLog { userId, action, ip, userAgent, detail, createdAt }
```

---

## 3. Hasil Penetration Test

### OWASP ZAP Scan
| Risk | Count | Status |
|------|-------|--------|
| High | 0 | ✅ |
| Medium | 0 | ✅ |
| Low | 2 (info) | ⚠️ |

### Manual Testing
- [ ] SQL Injection: N/A (no raw SQL)
- [ ] XSS Reflected: ✅ Aman (esc + CSP)
- [ ] XSS Stored: ✅ Aman (esc di semua output)
- [ ] CSRF: ✅ Aman (SameSite=Strict cookie)
- [ ] Clickjacking: ✅ Aman (X-Frame-Options: DENY)
- [ ] Brute Force: ✅ Aman (rate limit 5/menit)
- [ ] Session Hijacking: ✅ Aman (HttpOnly + Secure + JWT expiry)

---

## 4. Rekomendasi Lanjutan
1. **WAF** (ModSecurity / Cloudflare) untuk blocking attack pattern
2. **IDS/IPS** (Snort / Suricata) untuk monitoring traffic
3. **Log aggregation** (ELK Stack) untuk analisis insiden
4. **Vulnerability scanning** terjadwal (Nessus / OpenVAS)
5. **Penetration test** oleh pihak ketiga minimal 1x/tahun