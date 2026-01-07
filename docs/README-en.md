# Xray One-Click Configuration Script

[![GitHub Stars](https://img.shields.io/github/stars/DanOps-1/X-ray?style=flat-square)](https://github.com/DanOps-1/X-ray/stargazers)
[![License](https://img.shields.io/github/license/DanOps-1/X-ray?style=flat-square)](https://github.com/DanOps-1/X-ray/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/DanOps-1/X-ray?style=flat-square)](https://github.com/DanOps-1/X-ray/commits/main)
[![Platform](https://img.shields.io/badge/platform-Linux-blue?style=flat-square)](https://github.com/DanOps-1/X-ray)

[**中文**](../README.md) | [**English**](README-en.md)

**Quickly deploy Xray-core VLESS + XTLS-Reality proxy server**

This project provides fully automated Xray server configuration scripts and detailed tutorials. One-click deployment with no manual configuration required.

---

## ✨ Key Features

- ✅ **Fully Automated** - One-click installation, no user input needed
- 🔒 **Secure & Reliable** - Uses latest VLESS + XTLS-Reality protocol
- 📱 **Cross-Platform** - Compatible with Windows, macOS, Linux, Android, iOS
- 🚀 **Performance Optimized** - Built-in BBR, TCP Fast Open optimizations
- 📚 **Detailed Documentation** - Complete installation, configuration and troubleshooting guides
- 🛠️ **Management Tools** - User management, service updates, configuration backup tools
- 🌍 **Multi-Language** - English and Chinese documentation
- 🐳 **Docker Support** - Docker deployment option available

---

## 🚀 Quick Start

### Method 1: One-Click Installation (Recommended)

**Option A: Direct Download (For servers outside China)**

```bash
# Download and run the automated installation script
wget https://raw.githubusercontent.com/DanOps-1/X-ray/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

Or using curl:

```bash
curl -O https://raw.githubusercontent.com/DanOps-1/X-ray/main/scripts/install.sh
sudo bash install.sh
```

**Option B: Accelerated Download (For China or restricted networks)**

If the above commands timeout, use these acceleration methods:

```bash
# Using GitHub proxy
wget https://ghproxy.com/https://raw.githubusercontent.com/DanOps-1/X-ray/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

Or using jsDelivr CDN:

```bash
# jsDelivr CDN acceleration
wget https://cdn.jsdelivr.net/gh/DanOps-1/X-ray@main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

**Option C: Clone Repository (Recommended)**

```bash
# Direct clone
git clone https://github.com/DanOps-1/X-ray.git
cd X-ray/scripts
sudo bash install.sh

# If git clone also times out, use proxy
git clone https://ghproxy.com/https://github.com/DanOps-1/X-ray.git
cd X-ray/scripts
sudo bash install.sh
```

The installation script will automatically:
- ✅ Install the latest version of Xray-core
- ✅ Generate configuration parameters (UUID, keys, Short ID)
- ✅ Create and enable systemd service
- ✅ Display client configuration info and share link

### Method 2: Manual Installation

See **[Complete Installation Guide](installation-guide.md)** for detailed steps.

---

## 📱 Client Configuration

### Supported Clients

| Platform | Recommended Client | Download Link |
|----------|-------------------|---------------|
| **Windows** | v2rayN | [GitHub](https://github.com/2dust/v2rayN/releases) |
| **macOS** | V2rayU / V2RayXS | [V2rayU](https://github.com/yanue/V2rayU/releases) / [V2RayXS](https://github.com/tzmax/V2RayXS/releases) |
| **Linux** | v2ray-core / Qv2ray | [v2ray](https://github.com/v2fly/v2ray-core/releases) / [Qv2ray](https://github.com/Qv2ray/Qv2ray/releases) |
| **Android** | v2rayNG | [GitHub](https://github.com/2dust/v2rayNG/releases) |
| **iOS** | Shadowrocket / Quantumult X | App Store |

### Quick Import

The installation script generates a VLESS share link. In your client:
1. Copy the share link
2. Open client → "Import from Clipboard"
3. Connect and start using

Detailed guide: [Client Setup Guide](client-setup.md)

---

## 📂 Project Structure

```
X-ray/
├── README.md                           # Project documentation (English)
├── docs/
│   ├── README-zh.md                    # Project documentation (Chinese)
│   ├── installation-guide.md           # Complete installation tutorial
│   ├── client-setup.md                 # Client configuration guide
│   └── user-management.md              # User management guide
├── examples/
│   ├── config.json                     # Basic configuration template
│   └── config-multiple-users.json      # Multi-user configuration
└── scripts/
    ├── install.sh                      # One-click installation
    ├── add-user.sh                     # Add user
    ├── del-user.sh                     # Delete user
    ├── show-config.sh                  # Show configuration
    ├── update.sh                       # Update Xray
    ├── uninstall.sh                    # Uninstall Xray
    ├── backup.sh                       # Backup configuration
    └── generate-link.py                # Generate share link
```

---

## 🛠️ Management Tools

### User Management

```bash
# Add new user
sudo bash scripts/add-user.sh <user-email>

# Delete user
sudo bash scripts/del-user.sh <user-email>

# List all users
sudo bash scripts/show-config.sh users
```

### Service Management

```bash
# Start/Stop/Restart service
sudo systemctl start xray
sudo systemctl stop xray
sudo systemctl restart xray

# Check service status
sudo systemctl status xray

# View live logs
sudo journalctl -u xray -f
```

### Maintenance

```bash
# Update Xray to latest version
sudo bash scripts/update.sh

# Backup current configuration
sudo bash scripts/backup.sh

# Uninstall Xray
sudo bash scripts/uninstall.sh
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

1. ✅ Regularly rotate UUID and keys (every 3-6 months recommended)
2. ✅ Use strong passwords and non-standard ports
3. ✅ Enable firewall to restrict access sources
4. ✅ Keep Xray updated to latest version
5. ✅ Monitor logs for abnormal access
6. ✅ Regularly backup configuration files

---

## 📊 System Requirements

### Minimum Requirements
- **OS**: Linux (Debian, Ubuntu, CentOS, Kali, etc.)
- **Memory**: 512 MB RAM
- **Storage**: 100 MB available space
- **Network**: Public IP address

### Recommended Configuration
- **OS**: Ubuntu 22.04 LTS / Debian 12
- **Memory**: 1 GB RAM
- **CPU**: 1 core
- **Network**: 10 Mbps+ bandwidth

### Supported Cloud Platforms
- ✅ AWS EC2
- ✅ Google Cloud Platform
- ✅ Microsoft Azure
- ✅ DigitalOcean
- ✅ Vultr
- ✅ Linode
- ✅ Alibaba Cloud, Tencent Cloud, etc.

---

## 🐳 Docker Deployment

```bash
# Deploy using Docker (in development)
docker pull danops/xray-reality
docker run -d --name xray -p 443:443 danops/xray-reality
```

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

1. Fork this project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Submit Pull Request

---

## 📚 References

- [Xray Official Documentation](https://xtls.github.io/)
- [VLESS Protocol Specification](https://xtls.github.io/config/features/vless.html)
- [Reality Protocol Introduction](https://github.com/XTLS/REALITY)
- [Xray-core Source Code](https://github.com/XTLS/Xray-core)

---

## 📝 Changelog

### v1.0.0 (2026-01-07)
- ✅ Initial release
- ✅ Complete VLESS + XTLS-Reality configuration tutorial
- ✅ One-click installation script
- ✅ User management tools
- ✅ Detailed documentation and examples

---

## 📄 License

This project is licensed under the [MIT License](../LICENSE).

**Important**: Please read the [NOTICE - Terms of Use and Disclaimer](../NOTICE) before using

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

If you have questions or suggestions:
- 📧 Submit an [Issue](https://github.com/DanOps-1/X-ray/issues)
- 💡 Check the [FAQ](installation-guide.md#common-issues)
- 📖 Read the [Complete Documentation](installation-guide.md)

---

**⭐ If this project helps you, please give it a Star!**
