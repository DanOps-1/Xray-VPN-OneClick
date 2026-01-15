<div align="center">

<img src="../icon.png" alt="Xray VPN OneClick Logo" width="180" height="180">

# 🚀 Xray VPN OneClick

<h3>One-Click Xray VLESS+Reality Proxy Server Deployment</h3>

<p align="center">
  <strong>Latest Protocol | Secure & Reliable | 5-Min Setup | Cross-Platform</strong>
</p>

[![GitHub Stars](https://img.shields.io/github/stars/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&logo=github&color=yellow)](https://github.com/DanOps-1/Xray-VPN-OneClick/stargazers)
[![License](https://img.shields.io/github/license/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&color=blue)](https://github.com/DanOps-1/Xray-VPN-OneClick/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&color=green)](https://github.com/DanOps-1/Xray-VPN-OneClick/commits/main)
[![Language](https://img.shields.io/github/languages/top/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&color=orange)](https://github.com/DanOps-1/Xray-VPN-OneClick)

[![Platform](https://img.shields.io/badge/Platform-Linux-blue?style=for-the-badge&logo=linux)](https://github.com/DanOps-1/Xray-VPN-OneClick)
[![Protocol](https://img.shields.io/badge/Protocol-VLESS%2BReality-purple?style=for-the-badge)](https://github.com/XTLS/REALITY)
[![Docker](https://img.shields.io/badge/Docker-External-6c757d?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[**中文**](../README.md) | [**English**](README-en.md)

</div>

---

## 📑 Table of Contents

- [✨ Introduction](#-introduction)
- [🎯 Key Features](#-key-features)
- [🆚 Protocol Comparison](#-protocol-comparison)
- [🚀 Quick Start](#-quick-start)
  - [System Requirements](#system-requirements)
  - [One-Click Installation](#one-click-installation-recommended)
- [📱 Client Configuration](#-client-configuration)
- [🛠️ Service Management](#️-service-management)
- [🗑️ Uninstall & Cleanup](#️-uninstall--cleanup)
- [📖 Documentation](#-documentation)
- [🔒 Security Recommendations](#-security-recommendations)
- [📊 Supported Cloud Platforms](#-supported-cloud-platforms)
- [💡 FAQ](#-faq)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [⚠️ Disclaimer](#️-disclaimer)

---

## ✨ Introduction

**Xray VPN OneClick** is a fully automated Xray server deployment project using the latest **VLESS + XTLS-Reality** protocol, providing secure, high-speed, and hard-to-detect proxy services.

### Why Choose This Project?

| Feature | Description |
|---------|-------------|
| 🎯 **Zero-Config Deployment** | Complete installation with one command, auto-generate all parameters |
| 🔐 **Top-Level Security** | Reality protocol makes traffic indistinguishable from normal TLS |
| ⚡ **High Performance** | Built-in BBR congestion control and TCP Fast Open optimization |
| 📱 **Cross-Platform** | Supports Windows, macOS, Linux, Android, iOS |
| 🛠️ **Complete Tools** | User management, backup/restore, one-click updates |
| 📚 **Comprehensive Docs** | Complete bilingual documentation and troubleshooting guides |

---

## 🎯 Key Features

<table>
<tr>
<td width="50%">

### 🚀 Deployment Features
- ✅ **One-Click Install** - Deploy in 5 minutes
- ✅ **Auto-Configuration** - UUID & keys auto-generated
- ✅ **systemd Integration** - Auto-start on boot
- ✅ **Multiple Install Methods** - wget, curl, git clone
- ✅ **China Acceleration** - Mirror acceleration available

</td>
<td width="50%">

### 🔒 Security Features
- ✅ **VLESS Protocol** - Lightweight & high-performance
- ✅ **Reality Camouflage** - Traffic hard to identify
- ✅ **x25519 Keys** - Strong encryption
- ✅ **Short ID** - Enhanced security
- ✅ **Anti-Replay** - Built-in protection

</td>
</tr>
<tr>
<td width="50%">

### 🛠️ Management Features
- ✅ **User Management** - Add/delete users
- ✅ **Config Backup** - Auto backup & restore
- ✅ **One-Click Update** - Upgrade to latest version
- ✅ **View Config** - Display connection info
- ✅ **Safe Uninstall** - Complete system cleanup

</td>
<td width="50%">

### 📱 Client Features
- ✅ **Share Links** - Auto-generate VLESS URLs
- ✅ **QR Codes** - Quick scan import
- ✅ **All Platforms** - Major systems covered
- ✅ **Multi-Protocol** - v2ray ecosystem compatible
- ✅ **Detailed Guides** - Platform-specific tutorials

</td>
</tr>
</table>

---

## 🆚 Protocol Comparison

| Protocol | Speed | Security | Anti-Detection | Config Difficulty | Recommendation |
|----------|-------|----------|----------------|-------------------|----------------|
| **VLESS+Reality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ **Recommended** |
| VMess+WS+TLS | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⚠️ Average |
| Shadowsocks | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Easily Blocked |
| Trojan | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Alternative |
| V2Ray (Legacy) | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ❌ Outdated |

**VLESS+Reality Advantages:**
- 🎯 Traffic characteristics identical to real TLS 1.3 connections
- 🎯 No need to purchase domain or configure certificates
- 🎯 Minimal performance overhead, near direct-connection speed
- 🎯 Active probing cannot identify proxy characteristics

---

## 🚀 Quick Start

### System Requirements

<table>
<tr>
<td width="50%">

#### Minimum Requirements
- **OS**: Linux (see supported distros below)
- **RAM**: 512 MB
- **Storage**: 100 MB available
- **Network**: Public IP address

</td>
<td width="50%">

#### Recommended Configuration
- **OS**: Ubuntu 22.04 LTS / Debian 12
- **RAM**: 1 GB
- **CPU**: 1 core
- **Bandwidth**: 10 Mbps+

</td>
</tr>
</table>

#### Supported Operating Systems

| Distribution | Min Version | Package Manager | Status |
|--------------|-------------|-----------------|--------|
| Ubuntu | 22.04 | apt | ✅ Fully Supported |
| Debian | 11 | apt | ✅ Fully Supported |
| Kali Linux | 2023+ | apt | ✅ Fully Supported |
| CentOS Stream | 9 | dnf | ✅ Fully Supported |
| AlmaLinux | 9 | dnf | ✅ Fully Supported |
| Rocky Linux | 9 | dnf | ✅ Fully Supported |
| Fedora | 39 | dnf | ✅ Fully Supported |

### One-Click Installation (Recommended)

#### Option A: Direct Download (Servers outside China)

```bash
wget https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

Or using curl:

```bash
curl -O https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh
sudo bash install.sh
```

#### Option B: Accelerated Download (China or Restricted Networks)

If above commands timeout, use these acceleration methods:

```bash
# Using GitHub proxy
wget https://ghproxy.com/https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

Or using jsDelivr CDN:

```bash
# jsDelivr CDN acceleration
wget https://cdn.jsdelivr.net/gh/DanOps-1/Xray-VPN-OneClick@main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

#### Option C: Clone Repository (Most Complete)

```bash
# Direct clone
git clone https://github.com/DanOps-1/Xray-VPN-OneClick.git
cd Xray-VPN-OneClick/scripts
sudo bash install.sh

# If git clone times out, use proxy
git clone https://ghproxy.com/https://github.com/DanOps-1/Xray-VPN-OneClick.git
cd Xray-VPN-OneClick/scripts
sudo bash install.sh
```

### Installation Process

The installation script will automatically:

1. ✅ Detect system environment and install dependencies
2. ✅ Download and install latest Xray-core
3. ✅ Auto-generate configuration parameters (UUID, keys, Short ID)
4. ✅ Create optimized server configuration
5. ✅ Configure and start systemd service
6. ✅ Display client configuration info and share link

### After Installation

Upon completion, the script outputs:

```
================================
✅ Xray Installation Successful!
================================

📋 Server Information:
Address: YOUR_SERVER_IP
Port: 443

🔑 Client Configuration:
UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Public Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...

📱 Share Link:
vless://xxxxxxxx@YOUR_IP:443?...
```

**Save this information** for client configuration.

---

## 📱 Client Configuration

### Supported Clients

| Platform | Recommended Client | Download Link |
|----------|-------------------|---------------|
| **Windows** | v2rayN | [GitHub Releases](https://github.com/2dust/v2rayN/releases) |
| **macOS** | V2rayU / V2RayXS | [V2rayU](https://github.com/yanue/V2rayU/releases) \| [V2RayXS](https://github.com/tzmax/V2RayXS/releases) |
| **Linux** | v2ray-core / Qv2ray | [v2ray](https://github.com/v2fly/v2ray-core/releases) \| [Qv2ray](https://github.com/Qv2ray/Qv2ray/releases) |
| **Android** | v2rayNG | [GitHub Releases](https://github.com/2dust/v2rayNG/releases) |
| **iOS** | Shadowrocket / Quantumult X | App Store (US Account Required) |

### Quick Import

**Option 1: Using Share Link (Recommended)**

1. Copy the VLESS share link from installation output
2. Open client application
3. Select "Import from Clipboard" or "Scan QR Code"
4. Connect and start using

**Option 2: Manual Configuration**

See detailed tutorial: [Client Setup Guide](client-setup.md)

---

## 🛠️ Service Management

### Basic Commands

```bash
# Check service status
sudo systemctl status xray

# Start service
sudo systemctl start xray

# Stop service
sudo systemctl stop xray

# Restart service
sudo systemctl restart xray

# View live logs
sudo journalctl -u xray -f

# View recent logs
sudo journalctl -u xray -n 100
```

### User Management

```bash
# Add new user
sudo bash scripts/add-user.sh user@example.com

# Delete user
sudo bash scripts/del-user.sh user@example.com

# List all users
sudo bash scripts/show-config.sh users

# Show user's share link
sudo bash scripts/show-config.sh link user@example.com
```

### System Maintenance

```bash
# Update Xray to latest version
sudo bash scripts/update.sh

# Backup current configuration
sudo bash scripts/backup.sh

# Restore configuration
sudo bash scripts/restore.sh <backup-file>

# Uninstall Xray
sudo bash scripts/uninstall.sh
```

---

## 🗑️ Uninstall & Cleanup

### One-Click Uninstall (Recommended)

Use the provided uninstall script to safely remove Xray:

```bash
# If you cloned the repository
sudo bash scripts/uninstall.sh

# If you don't have the repository, download the uninstall script
wget https://ghproxy.com/https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/uninstall.sh
sudo bash uninstall.sh
```

**Uninstall Process:**

1. Confirm uninstall: Type `yes` to confirm
2. Choose whether to keep config backup:
   - Type `Y` or press Enter: Keep backup in `/var/backups/xray/`
   - Type `n`: Don't keep backup

**Automatic Cleanup:**
- ✅ Stop and disable Xray service
- ✅ Backup configuration files (optional)
- ✅ Uninstall Xray-core program
- ✅ Remove config directory `/usr/local/etc/xray`
- ✅ Remove log directory `/var/log/xray`
- ✅ Remove systemd service files

### Manual Cleanup

If the uninstall script doesn't work, manually execute these commands:

```bash
# 1. Stop and disable service
sudo systemctl stop xray
sudo systemctl disable xray

# 2. Backup configuration (optional)
sudo mkdir -p /var/backups/xray
sudo cp /usr/local/etc/xray/config.json /var/backups/xray/config-backup-$(date +%Y%m%d).json

# 3. Uninstall Xray using official script
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ remove --purge

# 4. Remove residual files
sudo rm -rf /usr/local/etc/xray
sudo rm -rf /var/log/xray
sudo rm -f /etc/systemd/system/xray.service
sudo rm -f /etc/systemd/system/xray@.service
sudo systemctl daemon-reload
```

### Complete Cleanup (Including Backups)

To completely remove all related files:

```bash
# Remove configuration backups
sudo rm -rf /var/backups/xray

# Remove project directory (if cloned)
rm -rf ~/Xray-VPN-OneClick
```

### Verify Cleanup

After uninstall, run these commands to verify cleanup:

```bash
# Check service status (should show "could not be found")
systemctl status xray

# Check if program exists (should have no output)
which xray

# Check config directory (should not exist)
ls /usr/local/etc/xray

# Check port usage (port 443 should be free)
sudo lsof -i :443
```

---

## 📖 Documentation

- [Complete Installation Guide](installation-guide.md) - Detailed installation and configuration steps
- [Client Setup Guide](client-setup.md) - Configuration methods for all platforms
- [User Management Guide](user-management.md) - Add, delete, and manage users
- [FAQ](installation-guide.md#common-issues) - Troubleshooting and solutions
- [Performance Optimization](installation-guide.md#performance-optimization) - Suggestions to improve performance

---

## 🔒 Security Recommendations

### Basic Security Measures

1. ✅ **Rotate Keys Regularly** - Recommended every 3-6 months for UUID and keys
2. ✅ **Use Strong Passwords** - Set strong passwords or key authentication for SSH
3. ✅ **Configure Firewall** - Only open necessary ports (443)
4. ✅ **Regular Updates** - Keep Xray updated to latest version
5. ✅ **Monitor Logs** - Regularly check logs for abnormal access
6. ✅ **Backup Configs** - Regular backups to secure locations

### Advanced Security Configuration

```bash
# Restrict SSH access
sudo ufw allow 22/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Disable root login (recommended)
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Configure automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📊 Supported Cloud Platforms

This project has been tested on the following cloud platforms:

### International Cloud Platforms
- ✅ **AWS EC2** - Amazon Web Services
- ✅ **Google Cloud Platform** - GCP Compute Engine
- ✅ **Microsoft Azure** - Azure Virtual Machines
- ✅ **DigitalOcean** - Droplets
- ✅ **Vultr** - Cloud Compute
- ✅ **Linode** - Akamai Cloud
- ✅ **Hetzner** - Cloud Servers

### Chinese Cloud Platforms
- ✅ **Alibaba Cloud** - ECS
- ✅ **Tencent Cloud** - CVM
- ✅ **Huawei Cloud** - ECS

> **Note**: Using on Chinese cloud platforms may face compliance risks, choose carefully.

---

## 🐳 Docker Deployment (External Image)

This repository does not ship a Dockerfile or docker-compose file yet. The commands below are external image examples.
Please refer to the image maintainer's documentation for the latest usage.

### Using Docker

```bash
# Pull external image (example)
docker pull danops/xray-reality

# Run container
docker run -d \
  --name xray \
  -p 443:443 \
  -v /etc/xray:/etc/xray \
  --restart=unless-stopped \
  danops/xray-reality
```

### Using Docker Compose

```yaml
version: '3'
services:
  xray:
    image: danops/xray-reality
    container_name: xray
    restart: unless-stopped
    ports:
      - "443:443"
    volumes:
      - ./config:/etc/xray
```

Detailed instructions: refer to the image maintainer's documentation

---

## 💡 FAQ

### 1. Port 443 is already in use?

```bash
# Check which process is using the port
sudo lsof -i :443

# Stop the occupying service
sudo systemctl stop nginx  # or other service

# Or modify Xray config to use another port
sudo nano /usr/local/etc/xray/config.json
```

### 2. Client cannot connect?

**Troubleshooting Steps:**

1. Confirm service is running: `sudo systemctl status xray`
2. Check firewall rules: `sudo ufw status`
3. Confirm cloud provider security group has opened port 443
4. Verify configuration info is correct (UUID, public key, etc.)
5. Check service logs: `sudo journalctl -u xray -f`

### 3. How to change the target camouflage website?

Edit config file `/usr/local/etc/xray/config.json`:

```json
"dest": "www.cloudflare.com:443",
"serverNames": ["www.cloudflare.com"]
```

Recommended: `www.microsoft.com`, `www.apple.com`, `www.cloudflare.com`

### 4. How to improve connection speed?

```bash
# Enable BBR congestion control
echo "net.core.default_qdisc=fq" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Enable TCP Fast Open
echo "net.ipv4.tcp_fastopen=3" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

More questions: [Complete FAQ List](installation-guide.md#common-issues)

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

### Contributing Process

1. Fork this project to your account
2. Create feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Submit Pull Request

### Contribution Suggestions

- 📝 Improve documentation and tutorials
- 🐛 Fix bugs and issues
- ✨ Add new features and tools
- 🌍 Translate documentation to other languages
- 📊 Optimize script performance

---

## 📝 Changelog

### v1.0.0 (2026-01-07)

**Initial Release**

- ✅ Complete VLESS + XTLS-Reality configuration tutorial
- ✅ Fully automated one-click installation script
- ✅ User management tools (add, delete, list)
- ✅ Service maintenance tools (update, backup, uninstall)
- ✅ Detailed bilingual documentation
- ✅ Multi-platform client configuration guides
- ✅ Performance optimization and security hardening guides

---

## 📚 References

### Official Documentation
- [Xray Official Website](https://xtls.github.io/)
- [VLESS Protocol Specification](https://xtls.github.io/config/features/vless.html)
- [Reality Protocol Introduction](https://github.com/XTLS/REALITY)
- [Xray-core Source Code](https://github.com/XTLS/Xray-core)

### Related Projects
- [v2rayN (Windows Client)](https://github.com/2dust/v2rayN)
- [v2rayNG (Android Client)](https://github.com/2dust/v2rayNG)
- [V2rayU (macOS Client)](https://github.com/yanue/V2rayU)

---

## 📄 License

This project is licensed under the [MIT License](../LICENSE).

**Important**: Please read [NOTICE - Terms of Use and Disclaimer](../NOTICE) before using

This means you can:
- ✅ Freely use, copy, modify, and distribute this project
- ✅ Use for commercial or non-commercial purposes (must comply with laws)
- ✅ Freely modify under license terms

But you must:
- ⚠️ Retain original author's copyright notice
- ⚠️ Provide license copy
- ⚠️ Comply with restrictions in NOTICE file

---

## ⚠️ Disclaimer

**Important**: This project is for **educational and research purposes only**.

### Usage Restrictions

- ✅ **Allowed**: Personal learning, technical research, legitimate corporate intranet, authorized security testing
- ❌ **Prohibited**: Any violation of local laws, accessing illegal content, unauthorized commercial use

### Legal Liability

1. Using proxy technology requires **compliance with local laws and regulations**
2. In some countries/regions (such as mainland China), unauthorized VPN use may be **illegal**
3. Users must **bear all legal consequences** themselves
4. The author is **NOT responsible for any consequences** arising from the use of this project
5. Users should **assess legal risks** independently

### Detailed Information

**Must read before use**: [NOTICE - Complete Terms of Use and Disclaimer](../NOTICE)

**If you do not agree with the terms or cannot ensure legal use, do NOT use this project.**

---

## 💬 Support

### How to Get Support

- 📧 **Submit Issue**: [GitHub Issues](https://github.com/DanOps-1/Xray-VPN-OneClick/issues)
- 💡 **FAQ**: Check [FAQ Documentation](installation-guide.md#common-issues)
- 📖 **Read Docs**: Complete [Installation and Configuration Tutorial](installation-guide.md)
- 🔍 **Search Existing Issues**: Search before asking if same issue exists

### Issue Submission Guidelines

Please provide the following information in your issue:

1. Your operating system and version
2. Xray version number
3. Detailed problem description and error messages
4. Related configuration files (hide sensitive information)
5. Solutions you've already tried

---

<div align="center">

**⭐ If this project helps you, please give it a Star!**

**🔄 Also welcome to Fork and share with friends!**

Made with ❤️ by [DanOps-1](https://github.com/DanOps-1)

</div>
