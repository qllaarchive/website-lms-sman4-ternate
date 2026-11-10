#!/usr/bin/env bash
# LMS SMA Negeri 4 Ternate — klien deploy (jalankan di MAC lokal).
#
# Sebelum dijalankan:
#   1. Buat VM Ubuntu di VirtualBox (lihat docs/DEPLOY-VIRTUALBOX-UMBRELLA.md)
#   2. Tariklah IP VM: `ipconfig getifaddr en0` (jika Bridged)
#
# Penggunaan:
#   ./deploy-client.sh <USER>@<IP-VM> [OPSIONAL_PATH]
#
# Contoh:
#   ./deploy-client.sh ubuntu@192.168.1.100
#   ./deploy-client.sh ubuntu@192.168.1.100 ~/projects/lms

set -euo pipefail

TARGET="${1:?Gunakan: ./deploy-client.sh <user>@<ip-vm> [local-path]}"
LOCAL_PATH="${2:-$(pwd)}"

if [ ! -d "$LOCAL_PATH" ]; then
  echo "ERROR: folder lokal '$LOCAL_PATH' tidak ada." >&2
  exit 1
fi

# Cari IP VM
echo ">>> Mencari IP VM di jaringan..."
VM_IP=$(ping -c 1 -W 1 "$TARGET" 2>/dev/null | grep -oE "([0-9]{1,3}\.){3}[0-9]{1,3}" | head -1)
if [ -z "$VM_IP" ]; then
  echo ">>> IP VM tidak diketahui dari target. Pastikan VM berjalan & reachable."
  read -rp ">>> Masukkan IP VM manual: " VM_IP
fi
echo ">>> IP VM: $VM_IP"

SSH_KEY=""
if [ -f "$HOME/.ssh/lms-deploy.key" ]; then
  SSH_KEY="-i $HOME/.ssh/lms-deploy.key"
fi
SSH_CMD="ssh $SSH_KEY $TARGET"

# 1) Cek SSH reachable
echo ">>> Memeriksa koneksi SSH..."
if ! $SSH_CMD "echo 'SSH OK'"; then
  echo ">>> SSH gagal. Membangun pair key..."
  ssh-keygen -t ed25519 -f "$HOME/.ssh/lms-deploy.key" -N "" -C "lms-deploy"
  eval "$($SSH_CMD ssh-add "$HOME/.ssh/lms-deploy.key" 2>/dev/null)" || true
  # Tambahkan key pub ke authorized_keys di server
  $SSH_CMD "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
  cat "$HOME/.ssh/lms-deploy.pub" >> "$HOME/.ssh/authorized_keys"
  $SSH_CMD "chmod 600 ~/.ssh/authorized_keys"
  echo ">>> SSH key dipindahkan."
fi
SSH_CMD="ssh $SSH_KEY $TARGET"

# 2) Siapkan direktori tujuan
$SSH_CMD "sudo mkdir -p /opt/lms && sudo chown ubuntu:ubuntu /opt/lms"

# 3) Salin kode (rsync, exclude node_modules & .git)
echo ">>> Mengirim kode ke server..."
rsync -azv --exclude node_modules --exclude .git \
  "$LOCAL_PATH/" "$TARGET:/opt/lms/" -e "$SSH_CMD"

# 4) Setup owner
$SSH_CMD "chown -R ubuntu:ubuntu /opt/lms"

echo ">>> Selesai mengirim. Langkah selanjutnya (di server):"
echo "    cd /opt/lms/api"
echo "    sudo bash scripts/deploy-ubuntu.sh <USER_ADMIN> <PASSWORD_ADMIN>"
echo ""
echo ">>> Cek status server:"
$SSH_CMD "sudo systemctl status lms-api --no-pager | head -5"
