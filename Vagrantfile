# -*- mode: Ruby -*-
# LMS SMA Negeri 4 Ternate — Vagrantfile (Ubuntu Server + VirtualBox).
# File ini IMBAS VirtualBox (installer dari https://www.vagrantup.com).
# Setelah diinstal: `vagrant up` → `vagrant ssh` → clone/rsync kode & deploy.

Vagrant.configure("2") do |config|
  # -------------------------------------------------------
  # 1. Kokohkan mesin
  # -------------------------------------------------------
  config.vm.define "lms-ubuntu", primary: true do |vm|
    vm.vm.box = "generic/ubuntu2404"
    vm.vm.box_version = "20251209.0.0"

    vm.vm.hostname = "lms-ubuntu"

    # -------------------------------------------------------
    # 2. Sumber daya (sesuai panduan DEPLOY.md)
    # -------------------------------------------------------
    vm.vm.synced_folder ".", "/vagrant", disabled: true

    vm.vm.provider "virtualbox" do |vb|
      vb.name = "lms-ubuntu"
      vb.memory = "4096"          # 4 GB RAM
      vb.cpus = 2                 # 2 core
      vb.linked_clone = true      # clone cepat
      vb.customize ["modifyvm", :id, "--cpus", "2"]
      vb.customize ["modifyvm", :id, "--memory", "4096"]
      vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
      vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    end

    # -------------------------------------------------------
    # 3. Jaringan (Bridged agar bisa diakses dari HP/jaringan lain)
    # -------------------------------------------------------
    # Pilih bridged adapter yang aktif di mesin physical
    vm.vm.network "public_network", mode: "bridge", dev: 0, use_dhcp_assigned_default_route: true
    # Ketika bridging work, akses API dari luar:
    #   http://<IP-FISIKAL>

    # OPPOST: Port forwarding (NAT) — ganti bridged dengan ini bila tidak mau setting manual
    # vm.vm.network "forwarded_port", guest: 80, host: 8080, id: "http"
    # vm.vm.network "forwarded_port", guest: 3000, host: 3000, id: "api"

    # Provisioning awal (auto-run saat `vagrant up`)
    vm.provision "shell", run: "always", inline: <<-SHELL
      export DEBIAN_FRONTEND=noninteractive
      apt-get update -y
      apt-get install -y openssh-server curl git ca-certificates
      systemctl enable --now ssh
      echo "Provisioning done at $(date)"
    SHELL
  end
end
