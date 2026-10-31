# Deploy ke Ubuntu Server (VPS)

Panduan native (tanpa Docker): PostgreSQL + Node.js + Nginx + systemd, semuanya
disiapkan otomatis oleh `scripts/setup-ubuntu.sh`. Estimasi total ±30 menit.

---

## 1. Dapat server Ubuntu gratis

**Rekomendasi: Oracle Cloud Free Tier** — benar-benar gratis selamanya (Always
Free), bukan trial. Spesifikasi gratisnya lebih dari cukup: 1 VM ARM Ampere A1
(2 OCPU + 12 GB RAM) + 200 GB storage.

Catatan penting: pendaftaran butuh **kartu untuk verifikasi identitas** (nama,
telepon, kartu). Tidak ditagih selama kamu tetap di paket Always Free. Kalau
sama sekali tidak bisa pakai kartu, pakai jalur tanpa kartu di `DEPLOY.md`
(Neon + Render + Netlify — bukan Ubuntu, tapi tanpa kartu sama sekali).

### Cara daftar + buat VM

1. Buka https://www.oracle.com/cloud/free/ → **Start for free**.
   Wilayah akun: pilih **Indonesia (Jakarta)** kalau tersedia, kalau penuh
   **Singapore** — biar akses dari Ternate cepat.
2. Setelah masuk Console (region kanan-atas harus sesuai pilihanmu):
   **Compute → Instances → Create instance**.
3. Pengaturan:
   - Image: **Ubuntu 22.04** (atau 24.04)
   - Shape: **Ampere** → **VM.Standard.A1.Flex** → **2 OCPU / 12 GB**
     (kalau muncul "out of capacity", coba 1 OCPU / 6 GB, beberapa kali
     di waktu berbeda biasanya berhasil)
   - SSH keys: **Download private & public key** — simpan berkas `.key` itu
     (jangan sampai hilang, ini satu-satunya pintu masuk!)
4. Klik **Create** → tunggu status **RUNNING** → catat **Public IP address**.

### Buka port 80 di panel Oracle (sering terlewat!)

**Networking → Virtual Cloud Networks → (VCN kamu) → Security Lists →
Default Security List → Add Ingress Rules:**

| Source Type | Source CIDR | Protocol | Dest. Port |
|---|---|---|---|
| CIDR | 0.0.0.0/0 | TCP | 80 |

Nanti kalau lanjut HTTPS: ulangi untuk port **443**.

---

## 2. Masuk server & unggah kode

Dari laptop kamu (di folder `LMS`):

```bash
chmod 400 keys/xxx.key          # sesuaikan nama file key-nya
ssh ubuntu@IP_SERVER -i keys/xxx.key
```

Di **laptop** (ganti `IP_SERVER` dan nama key):

```bash
rsync -azv --exclude node_modules --exclude .git \
  ./ ubuntu@IP_SERVER:/opt/lms/ -e "ssh -i keys/xxx.key"
```

> `sudo mkdir -p /opt/lms && sudo chown -R ubuntu:ubuntu /opt/lms` dulu di
> server kalau rsync menolak.

---

## 3. Jalankan provisioning (satu perintah)

Di **server**:

```bash
cd /opt/lms/scripts && sudo bash setup-ubuntu.sh
```

Script ini otomatis: install Node.js 20 + PostgreSQL + Nginx, buat database
`lms` (sandi acak), generate `api/.env` (JWT acak + kredensial DB), buat
user `lms`, jalankan migrate + seed, pasang systemd `lms-api.service`, pasang
config Nginx (portal + proxy `/api`), buka firewall, lalu health-check.

Pertanyaan yang muncul: **email/username admin** dan **kata sandi admin**
(mulai 12 karakter) — ini akun untuk login di website.

Selesai → buka dari HP/komputer mana pun: `http://IP-SERVER`

---

## 4. Verifikasi

| Cek | Perintah / cara | Harapan |
|---|---|---|
| API hidup | `curl http://IP_SERVER/health` | `{"ok":true}` |
| Portal | buka `http://IP-SERVER` di browser | halaman pembuka muncul |
| Login | tombol Masuk → isi kredensial admin | bisa buka Kelola |

Command sering dipakai:

```bash
sudo systemctl status lms-api      # status API
sudo journalctl -u lms-api -f      # log realtime
sudo systemctl restart lms-api     # restart API
sudo systemctl reload nginx        # reload nginx
```

---

## 5. Update aplikasi (jika ubah kode)

Ulangi `rsync` dari laptop, lalu di server:

```bash
cd /opt/lms/api
sudo systemctl restart lms-api
```

Kalau ada perubahan schema Prisma: `sudo -u lms npx prisma migrate deploy`.
Perubahan file statis (HTML/CSS/JS) tidak perlu restart — refresh browser saja.

## 6. Nanti: domain + HTTPS (opsional)

1. Punya domain (mis. `lms.sekolah.id` / subdomain `.sch.id`) → arahkan A record ke IP server.
2. Tambah `server_name domainmu;` di `/etc/nginx/sites-available/lms`.
3. Pasang sertifikat gratis Let's Encrypt:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d lms.sekolah.id
```

Setelah HTTPS aktif, cookie login otomatis berflag `Secure` kembali (kode API
sudah kondisional), dan tambahkan port 443 di Security List Oracle.

---

## Troubleshooting cepat

- **Website tidak mau dibuka dari luar** — pastikan Ingress Rule port 80
  sudah di Security List Oracle (bagian 1), dan di server jalankan
  `sudo ufw allow 80/tcp`. Oracle image kadang punya aturan iptables
  bawaan: `sudo iptables -F INPUT` lalu coba lagi (ufw tetap melindungi).
- **502 Bad Gateway** — API mati: `sudo journalctl -u lms-api -n 50`.
- **Login gagal padahal sandi benar** — browser lama menyimpan token rusak:
  keluar-masuk lagi; pastikan `NODE_ENV=production` dan jam server akurat
  (`timedatectl`).
- **"Failed to fetch"** — cek `curl http://127.0.0.1:3000/health` di server;
  kalau hidup berarti masalah di Nginx, kalau mati masalah di API.
