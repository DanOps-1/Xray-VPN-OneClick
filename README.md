<div align="center">

# 🚀 Xray VPN OneClick

<h3>一键部署 Xray VLESS+Reality 代理服务器</h3>

<p align="center">
  <strong>最新协议 | 安全可靠 | 5分钟部署 | 全平台支持</strong>
</p>

[![npm version](https://img.shields.io/npm/v/xray-manager?style=for-the-badge&logo=npm&color=red)](https://www.npmjs.com/package/xray-manager)
[![npm downloads](https://img.shields.io/npm/dm/xray-manager?style=for-the-badge&logo=npm&color=orange)](https://www.npmjs.com/package/xray-manager)
[![GitHub Stars](https://img.shields.io/github/stars/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&logo=github&color=yellow)](https://github.com/DanOps-1/Xray-VPN-OneClick/stargazers)
[![codecov](https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick/branch/main/graph/badge.svg)](https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick)
[![License](https://img.shields.io/github/license/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&color=blue)](https://github.com/DanOps-1/Xray-VPN-OneClick/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&color=green)](https://github.com/DanOps-1/Xray-VPN-OneClick/commits/main)

[![Platform](https://img.shields.io/badge/Platform-Linux-blue?style=for-the-badge&logo=linux)](https://github.com/DanOps-1/Xray-VPN-OneClick)
[![Protocol](https://img.shields.io/badge/Protocol-VLESS%2BReality-purple?style=for-the-badge)](https://github.com/XTLS/REALITY)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[**中文**](README.md) | [**English**](docs/README-en.md)

</div>

---

## 📑 目录

- [✨ 项目简介](#-项目简介)
- [🎯 主要特性](#-主要特性)
- [🆚 协议对比](#-协议对比)
- [🚀 快速开始](#-快速开始)
  - [系统要求](#系统要求)
  - [一键安装](#一键安装推荐)
- [📱 客户端配置](#-客户端配置)
- [🛠️ 服务管理](#️-服务管理)
- [🗑️ 卸载与清理](#️-卸载与清理)
- [📖 详细文档](#-详细文档)
- [🔒 安全建议](#-安全建议)
- [📊 支持的云平台](#-支持的云平台)
- [💡 常见问题](#-常见问题)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)
- [⚠️ 免责声明](#️-免责声明)

---

## ✨ 项目简介

**Xray VPN OneClick** 是一个完全自动化的 Xray 服务端部署项目，使用最新的 **VLESS + XTLS-Reality** 协议，为用户提供安全、高速、难以被检测的代理服务。

### 为什么选择本项目？

| 特点 | 说明 |
|------|------|
| 🎯 **零配置部署** | 一行命令完成安装，自动生成所有配置参数 |
| 🔐 **顶级安全** | 使用 Reality 协议，流量特征与正常 TLS 无法区分 |
| ⚡ **高性能** | 内置 BBR 拥塞控制和 TCP Fast Open 优化 |
| 📱 **全平台兼容** | 支持 Windows、macOS、Linux、Android、iOS |
| 🛠️ **完善工具** | 提供用户管理、备份恢复、一键更新等工具 |
| 📚 **详尽文档** | 完整的中英文文档和故障排查指南 |

---

## 🎯 主要特性

<table>
<tr>
<td width="50%">

### 🚀 部署特性
- ✅ **一键安装** - 5分钟内完成部署
- ✅ **自动配置** - UUID、密钥自动生成
- ✅ **systemd 集成** - 开机自启动
- ✅ **多种安装方式** - wget、curl、git clone
- ✅ **国内加速** - 提供镜像加速下载

</td>
<td width="50%">

### 🔒 安全特性
- ✅ **VLESS 协议** - 轻量级高性能
- ✅ **Reality 伪装** - 流量难以识别
- ✅ **x25519 密钥** - 强加密保护
- ✅ **Short ID** - 增强安全性
- ✅ **防重放攻击** - 内置保护机制

</td>
</tr>
<tr>
<td width="50%">

### 🛠️ 管理特性
- ✅ **用户管理** - 添加/删除用户
- ✅ **配置备份** - 自动备份恢复
- ✅ **一键更新** - 升级到最新版本
- ✅ **查看配置** - 显示连接信息
- ✅ **安全卸载** - 完整清理系统

</td>
<td width="50%">

### 📱 客户端特性
- ✅ **分享链接** - 自动生成 VLESS URL
- ✅ **二维码** - 扫码快速导入
- ✅ **全平台** - 主流系统全覆盖
- ✅ **多协议** - 兼容 v2ray 生态
- ✅ **详细教程** - 分平台配置指南

</td>
</tr>
</table>

---

## 🆚 协议对比

| 协议 | 速度 | 安全性 | 抗检测 | 配置难度 | 推荐度 |
|------|------|--------|--------|----------|--------|
| **VLESS+Reality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ **推荐** |
| VMess+WebSocket+TLS | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⚠️ 一般 |
| Shadowsocks | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ 易封锁 |
| Trojan | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ 可选 |
| V2Ray (传统) | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ❌ 过时 |

**VLESS+Reality 优势：**
- 🎯 流量特征与真实 TLS 1.3 连接完全相同
- 🎯 无需购买域名和配置证书
- 🎯 性能损耗极小，接近直连速度
- 🎯 主动探测无法识别代理特征

---

## 🚀 快速开始

### 系统要求

<table>
<tr>
<td width="50%">

#### 最低配置
- **操作系统**: Linux (Debian/Ubuntu/CentOS/Kali)
- **内存**: 512 MB RAM
- **存储**: 100 MB 可用空间
- **网络**: 公网 IP 地址

</td>
<td width="50%">

#### 推荐配置
- **操作系统**: Ubuntu 22.04 LTS / Debian 12
- **内存**: 1 GB RAM
- **CPU**: 1 核心
- **带宽**: 10 Mbps+

</td>
</tr>
</table>

### 一键安装（推荐）

#### 方式一：直接下载（国外服务器）

```bash
wget https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

或者使用 curl：

```bash
curl -O https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh
sudo bash install.sh
```

#### 方式二：加速下载（国内服务器或网络受限）

如果上述命令连接超时，使用以下加速方法：

```bash
# 使用 GitHub 代理加速
wget https://ghproxy.com/https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

或使用 jsDelivr CDN：

```bash
# jsDelivr CDN 加速
wget https://cdn.jsdelivr.net/gh/DanOps-1/Xray-VPN-OneClick@main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

#### 方式三：克隆仓库（最完整）

```bash
# 直接克隆
git clone https://github.com/DanOps-1/Xray-VPN-OneClick.git
cd Xray-VPN-OneClick/scripts
sudo bash install.sh

# 如果 git clone 也超时，使用代理
git clone https://ghproxy.com/https://github.com/DanOps-1/Xray-VPN-OneClick.git
cd Xray-VPN-OneClick/scripts
sudo bash install.sh
```

### 安装过程

安装脚本会自动完成以下步骤：

1. ✅ 检测系统环境并安装依赖
2. ✅ 下载并安装最新版 Xray-core
3. ✅ 自动生成配置参数（UUID、密钥对、Short ID）
4. ✅ 创建优化的服务端配置文件
5. ✅ 配置并启动 systemd 服务
6. ✅ 显示客户端配置信息和分享链接

### 安装完成后

安装完成后，脚本会输出以下信息：

```
================================
✅ Xray 安装成功！
================================

📋 服务器信息：
地址: YOUR_SERVER_IP
端口: 443

🔑 客户端配置：
UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Public Key: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...

📱 分享链接：
vless://xxxxxxxx@YOUR_IP:443?...
```

**保存好这些信息**，用于客户端配置。

---

## 📱 客户端配置

### 支持的客户端

| 平台 | 推荐客户端 | 下载链接 |
|------|-----------|---------|
| **Windows** | v2rayN | [GitHub Releases](https://github.com/2dust/v2rayN/releases) |
| **macOS** | V2rayU / V2RayXS | [V2rayU](https://github.com/yanue/V2rayU/releases) \| [V2RayXS](https://github.com/tzmax/V2RayXS/releases) |
| **Linux** | v2ray-core / Qv2ray | [v2ray](https://github.com/v2fly/v2ray-core/releases) \| [Qv2ray](https://github.com/Qv2ray/Qv2ray/releases) |
| **Android** | v2rayNG | [GitHub Releases](https://github.com/2dust/v2rayNG/releases) |
| **iOS** | Shadowrocket / Quantumult X | App Store（需美区账号）|

### 快速导入配置

**方式一：使用分享链接（推荐）**

1. 复制安装脚本输出的 VLESS 分享链接
2. 打开客户端应用
3. 选择"从剪贴板导入"或"扫描二维码"
4. 连接并开始使用

**方式二：手动配置**

查看详细教程：[客户端配置指南](docs/client-setup.md)

---

## 🛠️ 服务管理

### 方式一：交互式 CLI 工具（推荐）⭐

我们提供了一个强大的 npm 命令行工具，让 Xray 服务管理变得简单直观：

#### 安装 CLI 工具

**方式一：从 npm 安装（推荐）⭐**

```bash
# 全局安装（推荐）
npm install -g xray-manager

# 或使用 npx（无需安装）
npx xray-manager
```

**方式二：从源代码安装**

```bash
# 克隆仓库
git clone https://github.com/DanOps-1/Xray-VPN-OneClick.git
cd Xray-VPN-OneClick

# 安装依赖并全局安装
npm install
sudo npm install -g .
```

**npm 包信息**
- 📦 包名: `xray-manager`
- 🔗 npm 主页: https://www.npmjs.com/package/xray-manager
- 📥 每周下载: [![npm](https://img.shields.io/npm/dw/xray-manager)](https://www.npmjs.com/package/xray-manager)

#### 启动交互式菜单

```bash
# 使用全名
xray-manager

# 或使用简短别名
xm
```

#### CLI 功能特性

<table>
<tr>
<td width="50%">

**📊 服务管理**
- 查看服务状态（运行时长、内存使用）
- 启动/停止/重启服务
- 自动检测权限和 systemd

</td>
<td width="50%">

**👥 用户管理**
- 列出所有用户
- 添加新用户（自动生成 UUID）
- 删除用户
- 显示分享链接（自动复制到剪贴板）

</td>
</tr>
<tr>
<td width="50%">

**⚙️  配置管理**
- 查看当前配置
- 创建配置备份（时间戳命名）
- 列出所有备份
- 恢复配置
- 修改配置项

</td>
<td width="50%">

**📝 日志查看**
- 查看最近日志
- 实时跟踪日志（Ctrl+C 停止）
- 按级别过滤（error/warning/info/debug）
- 按时间范围过滤

</td>
</tr>
</table>

#### 终端兼容性 🌍

CLI 工具现已支持多种终端环境，自动适配不同系统：

**🖥️ 支持的终端**
- ✅ **现代终端**: xterm, iTerm2, GNOME Terminal, Konsole（Unicode + 彩色）
- ✅ **Windows CMD**: 完全兼容（纯 ASCII 文本图标）
- ✅ **SSH 会话**: 自动检测并适配远程终端
- ✅ **传统终端**: vt100, dumb terminal（降级到 ASCII）
- ✅ **管道输出**: 重定向时自动切换到纯文本 + 时间戳模式

**🎨 三种输出模式**

| 模式 | 使用场景 | 特性 |
|------|---------|------|
| **RICH** | 现代终端（默认） | 彩色 + Unicode 图标 + 格式化 |
| **PLAIN_TTY** | 无彩色终端 | ASCII 图标 + 格式化（无彩色） |
| **PIPE** | 管道/日志文件 | 纯文本 + 时间戳 + 结构化输出 |

**🔧 自动检测特性**
- TTY 状态检测
- 颜色支持检测（支持 NO_COLOR 环境变量）
- Unicode 支持检测（基于 TERM 环境变量和平台）
- 终端宽度自适应（80-160 列优化）

**📐 80 列兼容**

所有 UI 元素已优化为 80 列布局，确保在各种终端宽度下正确显示：
- 菜单选项 + 描述 ≤ 80 列
- 表格和分隔符自适应终端宽度
- 窄终端（40-80 列）友好

**示例输出**

```
# 现代终端 (RICH 模式)
✓ 服务启动成功！
[查看] 查看服务状态
[启动] 启动服务

# Windows CMD (PLAIN_TTY 模式)
[OK] 服务启动成功！
[查看] 查看服务状态
[启动] 启动服务

# 管道输出 (PIPE 模式)
2026-01-08T10:30:45.123Z [OK] 服务启动成功
```

#### 菜单结构

```
Xray Manager - 交互式管理工具
├── 📊 查看服务状态
├── 🚀 启动服务
├── 🛑 停止服务
├── 🔄 重启服务
├── 👥 用户管理
│   ├── 📋 查看用户列表
│   ├── ➕ 添加用户
│   ├── ➖ 删除用户
│   └── 📤 显示分享链接
├── ⚙️  配置管理
│   ├── 📄 查看当前配置
│   ├── 💾 备份配置
│   ├── 📋 查看备份列表
│   ├── ♻️  恢复配置
│   └── ✏️  修改配置项
└── 📝 日志查看
    ├── 📄 查看最近日志
    ├── 🔴 实时跟踪日志
    └── 🔍 过滤日志
```

#### 安全特性

- ✅ **命令注入防护** - 所有输入都经过严格验证
- ✅ **敏感信息脱敏** - UUID、密钥显示为 `前4后4` 格式
- ✅ **自动备份** - 修改配置前自动创建备份
- ✅ **权限检测** - 自动检测 sudo 权限并提示
- ✅ **安全文件权限** - 配置文件权限设置为 600

---

### 方式二：systemd 原生命令

```bash
# 查看服务状态
sudo systemctl status xray

# 启动服务
sudo systemctl start xray

# 停止服务
sudo systemctl stop xray

# 重启服务
sudo systemctl restart xray

# 查看实时日志
sudo journalctl -u xray -f

# 查看最近日志
sudo journalctl -u xray -n 100
```

### 方式三：Bash 脚本工具

```bash
# 添加新用户
sudo bash scripts/add-user.sh user@example.com

# 删除用户
sudo bash scripts/del-user.sh user@example.com

# 列出所有用户
sudo bash scripts/show-config.sh users

# 显示用户的分享链接
sudo bash scripts/show-config.sh link user@example.com
```

### 系统维护

```bash
# 更新 Xray 到最新版本
sudo bash scripts/update.sh

# 备份当前配置
sudo bash scripts/backup.sh

# 恢复配置
sudo bash scripts/restore.sh <备份文件>

# 卸载 Xray
sudo bash scripts/uninstall.sh
```

---

## 🗑️ 卸载与清理

### 一键卸载（推荐）

使用提供的卸载脚本可以安全地卸载 Xray：

```bash
# 如果克隆了仓库
sudo bash scripts/uninstall.sh

# 如果没有仓库，下载卸载脚本
wget https://ghproxy.com/https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/uninstall.sh
sudo bash uninstall.sh
```

**卸载过程：**

1. 确认卸载：输入 `yes` 确认
2. 选择是否保留配置备份：
   - 输入 `Y` 或回车：保留备份到 `/var/backups/xray/`
   - 输入 `n`：不保留备份

**自动清理内容：**
- ✅ 停止并禁用 Xray 服务
- ✅ 备份配置文件（可选）
- ✅ 卸载 Xray-core 程序
- ✅ 删除配置目录 `/usr/local/etc/xray`
- ✅ 删除日志目录 `/var/log/xray`
- ✅ 删除 systemd 服务文件

### 手动清理

如果卸载脚本无法使用，可以手动执行以下命令：

```bash
# 1. 停止并禁用服务
sudo systemctl stop xray
sudo systemctl disable xray

# 2. 备份配置（可选）
sudo mkdir -p /var/backups/xray
sudo cp /usr/local/etc/xray/config.json /var/backups/xray/config-backup-$(date +%Y%m%d).json

# 3. 使用官方脚本卸载 Xray
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ remove --purge

# 4. 删除残留文件
sudo rm -rf /usr/local/etc/xray
sudo rm -rf /var/log/xray
sudo rm -f /etc/systemd/system/xray.service
sudo rm -f /etc/systemd/system/xray@.service
sudo systemctl daemon-reload
```

### 彻底清理（包括备份）

如果要完全删除所有相关文件：

```bash
# 删除配置备份
sudo rm -rf /var/backups/xray

# 删除项目目录（如果克隆了仓库）
rm -rf ~/Xray-VPN-OneClick
```

### 验证清理结果

卸载后运行以下命令检查是否清理干净：

```bash
# 检查服务状态（应该显示 "could not be found"）
systemctl status xray

# 检查程序是否存在（应该没有输出）
which xray

# 检查配置目录（应该不存在）
ls /usr/local/etc/xray

# 检查端口占用（443 端口应该空闲）
sudo lsof -i :443
```

---

## 📖 详细文档

- [完整安装教程](docs/installation-guide.md) - 手动安装的详细步骤说明
- [客户端配置指南](docs/client-setup.md) - 各平台客户端的详细配置方法
- [用户管理指南](docs/user-management.md) - 如何添加、删除和管理多个用户
- [常见问题解答](docs/installation-guide.md#常见问题) - 常见问题的排查和解决方案
- [性能优化指南](docs/installation-guide.md#性能优化) - 提升服务器性能的建议

---

## 🔒 安全建议

### 基本安全措施

1. ✅ **定期更换密钥** - 建议每 3-6 个月更换 UUID 和密钥对
2. ✅ **使用强密码** - 为服务器 SSH 设置强密码或密钥认证
3. ✅ **配置防火墙** - 只开放必要的端口（443）
4. ✅ **定期更新** - 及时更新 Xray 到最新版本修复安全漏洞
5. ✅ **监控日志** - 定期检查日志发现异常访问
6. ✅ **配置备份** - 定期备份配置文件到安全位置

### 进阶安全配置

```bash
# 限制 SSH 访问
sudo ufw allow 22/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 禁用 root 登录（推荐）
sudo nano /etc/ssh/sshd_config
# 设置: PermitRootLogin no
sudo systemctl restart sshd

# 配置自动安全更新
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📊 支持的云平台

本项目已在以下云平台测试通过：

### 国外云平台
- ✅ **AWS EC2** - Amazon Web Services
- ✅ **Google Cloud Platform** - GCP Compute Engine
- ✅ **Microsoft Azure** - Azure Virtual Machines
- ✅ **DigitalOcean** - Droplets
- ✅ **Vultr** - Cloud Compute
- ✅ **Linode** - Akamai Cloud
- ✅ **Hetzner** - Cloud Servers

### 国内云平台
- ✅ **阿里云** - ECS 云服务器
- ✅ **腾讯云** - CVM 云服务器
- ✅ **华为云** - ECS 弹性云服务器

> **注意**: 在国内云平台使用可能面临合规风险，请谨慎选择。

---

## 🐳 Docker 部署

### 使用 Docker 部署

```bash
# 拉取镜像（开发中）
docker pull danops/xray-reality

# 运行容器
docker run -d \
  --name xray \
  -p 443:443 \
  -v /etc/xray:/etc/xray \
  --restart=unless-stopped \
  danops/xray-reality
```

### 使用 Docker Compose

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

详细说明：即将推出

---

## 💡 常见问题

### 1. 端口 443 被占用怎么办？

```bash
# 查看占用端口的进程
sudo lsof -i :443

# 停止占用的服务
sudo systemctl stop nginx  # 或其他服务

# 或修改 Xray 配置使用其他端口
sudo nano /usr/local/etc/xray/config.json
```

### 2. 客户端无法连接？

**排查步骤**：

1. 确认服务正在运行：`sudo systemctl status xray`
2. 检查防火墙规则：`sudo ufw status`
3. 确认云服务商安全组已开放 443 端口
4. 检查配置信息是否正确（UUID、公钥等）
5. 查看服务日志：`sudo journalctl -u xray -f`

### 3. 如何更换伪装目标网站？

编辑配置文件 `/usr/local/etc/xray/config.json`：

```json
"dest": "www.cloudflare.com:443",
"serverNames": ["www.cloudflare.com"]
```

推荐使用：`www.microsoft.com`、`www.apple.com`、`www.cloudflare.com`

### 4. 如何提升连接速度？

```bash
# 启用 BBR 拥塞控制
echo "net.core.default_qdisc=fq" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# 启用 TCP Fast Open
echo "net.ipv4.tcp_fastopen=3" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

更多问题查看：[常见问题完整列表](docs/installation-guide.md#常见问题)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进本项目！

### 贡献流程

1. Fork 本项目到你的账号
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交你的更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

### 贡献建议

- 📝 改进文档和教程
- 🐛 修复 bug 和问题
- ✨ 添加新功能和工具
- 🌍 翻译文档到其他语言
- 📊 优化脚本性能

---

## 📝 更新日志

### v1.1.0 (2026-01-08)

**CLI 用户界面优化**

- ✅ 终端能力自动检测系统（TTY/颜色/Unicode/宽度）
- ✅ 智能图标解析器（Unicode ↔️ ASCII 自动适配）
- ✅ 三种输出模式（RICH/PLAIN_TTY/PIPE）
- ✅ Windows CMD 完全兼容（纯 ASCII 文本图标）
- ✅ 所有 emoji 替换为文本标签 [标签] 格式
- ✅ 菜单清晰分组（服务操作/管理功能/退出）
- ✅ 80 列布局优化（所有 UI 元素宽度验证）
- ✅ 210 个测试全部通过，覆盖率 >90%

### v1.0.0 (2026-01-07)

**首次发布**

- ✅ 完整的 VLESS + XTLS-Reality 配置教程
- ✅ 全自动一键安装脚本
- ✅ 用户管理工具（添加、删除、列表）
- ✅ 服务维护工具（更新、备份、卸载）
- ✅ 详细的中英文文档
- ✅ 多平台客户端配置指南
- ✅ 性能优化和安全加固指南

---

## 📚 参考资源

### 官方文档
- [Xray 官方网站](https://xtls.github.io/)
- [VLESS 协议规范](https://xtls.github.io/config/features/vless.html)
- [Reality 协议介绍](https://github.com/XTLS/REALITY)
- [Xray-core 源代码](https://github.com/XTLS/Xray-core)

### 相关项目
- [v2rayN (Windows 客户端)](https://github.com/2dust/v2rayN)
- [v2rayNG (Android 客户端)](https://github.com/2dust/v2rayNG)
- [V2rayU (macOS 客户端)](https://github.com/yanue/V2rayU)

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

**重要**: 使用前请务必阅读 [NOTICE - 使用须知与免责声明](NOTICE)

这意味着你可以：
- ✅ 自由使用、复制、修改和分发本项目
- ✅ 用于商业或非商业目的（需遵守法律）
- ✅ 在遵守许可证的前提下自由修改

但需要：
- ⚠️ 保留原作者的版权声明
- ⚠️ 提供许可证副本
- ⚠️ 遵守 NOTICE 文件中的使用限制

---

## ⚠️ 免责声明

**重要提示**: 本项目仅供**学习和研究**使用。

### 使用限制

- ✅ **允许**: 个人学习、技术研究、合法的企业内网、授权的安全测试
- ❌ **禁止**: 任何违反当地法律法规的行为、访问非法内容、未授权的商业使用

### 法律责任

1. 使用代理技术需**遵守当地法律法规**
2. 在某些国家/地区（如中国大陆），未经授权使用 VPN 可能**违法**
3. 用户需**自行承担**所有法律后果
4. 作者**不对使用本项目造成的任何后果负责**
5. 使用者应**自行评估**法律风险

### 详细说明

**使用前请务必阅读**: [NOTICE - 完整的使用须知与免责声明](NOTICE)

**如果你不同意相关条款或无法确保合法使用，请勿使用本项目。**

---

## 💬 获取帮助

### 如何获取支持

- 📧 **提交 Issue**: [GitHub Issues](https://github.com/DanOps-1/Xray-VPN-OneClick/issues)
- 💡 **常见问题**: 查看 [FAQ 文档](docs/installation-guide.md#常见问题)
- 📖 **阅读文档**: 完整的 [安装和配置教程](docs/installation-guide.md)
- 🔍 **搜索已有问题**: 在提问前先搜索是否有相同问题

### 提交 Issue 的建议

请在 Issue 中提供以下信息：

1. 你的操作系统和版本
2. Xray 版本号
3. 详细的问题描述和错误信息
4. 相关的配置文件（隐藏敏感信息）
5. 你已经尝试过的解决方法

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star 支持一下！**

**🔄 也欢迎 Fork 和分享给需要的朋友！**

Made with ❤️ by [DanOps-1](https://github.com/DanOps-1)

</div>
