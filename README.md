<div align="center">

<img src="icon.png" alt="Xray VPN OneClick Logo" width="180" height="180">

# 🚀 Xray VPN OneClick | 一键科学上网

<h3>5分钟部署 VLESS+Reality 代理服务器 — 最强抗封锁协议</h3>

<p align="center">
  <strong>🔥 无需域名/证书 | 流量伪装 TLS 1.3 | 主动探测防御 | 全平台客户端支持</strong>
</p>

<p align="center">
  <em>自建梯子 · 科学上网 · 翻墙工具 · VPN替代方案 · 访问ChatGPT/Claude</em>
</p>

---

### ⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！

<p align="center">
  <strong>你的 Star 是我持续更新的最大动力 🙏</strong><br>
  <em>开源不易，维护更难。一个 Star，一份鼓励！</em>
</p>

<p align="center">
  <a href="https://github.com/DanOps-1/Xray-VPN-OneClick">
    <img src="https://img.shields.io/github/stars/DanOps-1/Xray-VPN-OneClick?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/DanOps-1/Xray-VPN-OneClick/fork">
    <img src="https://img.shields.io/github/forks/DanOps-1/Xray-VPN-OneClick?style=social" alt="GitHub forks">
  </a>
</p>

<!-- 核心徽章 -->
[![npm version](https://img.shields.io/npm/v/xray-manager?style=for-the-badge&logo=npm&color=red)](https://www.npmjs.com/package/xray-manager)
[![npm downloads](https://img.shields.io/npm/dm/xray-manager?style=for-the-badge&logo=npm&color=orange)](https://www.npmjs.com/package/xray-manager)
[![GitHub Stars](https://img.shields.io/github/stars/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&logo=github&color=yellow)](https://github.com/DanOps-1/Xray-VPN-OneClick/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&logo=github)](https://github.com/DanOps-1/Xray-VPN-OneClick/network/members)

<!-- CI/CD 徽章 -->
[![CI](https://img.shields.io/github/actions/workflow/status/DanOps-1/Xray-VPN-OneClick/ci.yml?style=for-the-badge&logo=github-actions&label=CI)](https://github.com/DanOps-1/Xray-VPN-OneClick/actions)
[![codecov](https://img.shields.io/codecov/c/github/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&logo=codecov)](https://codecov.io/gh/DanOps-1/Xray-VPN-OneClick)
[![License](https://img.shields.io/github/license/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&color=blue)](https://github.com/DanOps-1/Xray-VPN-OneClick/blob/main/LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&color=green)](https://github.com/DanOps-1/Xray-VPN-OneClick/commits/main)

<!-- 技术栈徽章 -->
[![Platform](https://img.shields.io/badge/Platform-Linux-blue?style=for-the-badge&logo=linux)](https://github.com/DanOps-1/Xray-VPN-OneClick)
[![Protocol](https://img.shields.io/badge/Protocol-VLESS%2BReality-purple?style=for-the-badge)](https://github.com/XTLS/REALITY)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

<!-- 社区徽章 -->
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge)](https://github.com/DanOps-1/Xray-VPN-OneClick/pulls)
[![GitHub Issues](https://img.shields.io/github/issues/DanOps-1/Xray-VPN-OneClick?style=for-the-badge&logo=github&color=red)](https://github.com/DanOps-1/Xray-VPN-OneClick/issues)

[**中文**](README.md) | [**English**](docs/README-en.md)

</div>

---

## ⚡ 30秒快速安装

```bash
# 一键安装 Xray + VLESS + Reality（复制粘贴即可）
wget https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh && sudo bash xray-install.sh
```

<details>
<summary>📦 其他安装方式（npm / 国内加速 / git clone）</summary>

```bash
# npm 全局安装（需要 Node.js 18+）
npm install -g xray-manager && sudo xm install

# 国内服务器加速
wget https://ghproxy.com/https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh && sudo bash xray-install.sh

# 克隆仓库安装
git clone https://github.com/DanOps-1/Xray-VPN-OneClick.git && cd Xray-VPN-OneClick/scripts && sudo bash install.sh
```

</details>

> **系统要求：** Linux (Ubuntu 22.04+ / Debian 11+ / CentOS 9+)，512MB RAM，公网 IP

---

## 📸 界面预览

<div align="center">
  <img src="interface.png" alt="Xray Manager 交互式界面" width="100%">
  <p><em>现代化的交互式管理界面，支持服务管理、用户管理、流量配额等功能</em></p>
</div>

---

## 📑 目录

- [✨ 项目简介](#-项目简介)
- [🌐 使用场景](#-使用场景)
- [🎯 主要特性](#-主要特性)
- [🆚 协议对比](#-协议对比)
- [🚀 快速开始](#-快速开始)
- [🛠️ 服务管理](#️-服务管理)
- [📱 客户端配置](#-客户端配置)
- [🗑️ 卸载与清理](#️-卸载与清理)
- [💡 常见问题](#-常见问题)
- [📖 详细文档](#-详细文档)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)

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

## 🌐 使用场景

<table>
<tr>
<td width="50%">

### 🤖 访问 AI 服务
- ChatGPT / GPT-4
- Claude / Anthropic
- Google Gemini / Bard
- Midjourney / DALL-E
- GitHub Copilot

</td>
<td width="50%">

### 🔒 隐私与安全
- 公共 WiFi 安全防护
- 防止 ISP 流量监控
- 保护敏感通信
- 匿名浏览

</td>
</tr>
<tr>
<td width="50%">

### 💼 远程办公
- 安全访问公司内网
- 跨国团队协作
- 远程开发环境
- 企业 VPN 替代方案

</td>
<td width="50%">

### 🎓 学术研究
- 访问 Google Scholar
- 下载学术论文
- 使用国际学术资源
- 参与国际学术交流

</td>
</tr>
<tr>
<td width="50%">

### 👨‍💻 开发者工具
- 访问 GitHub / GitLab
- 使用 npm / Docker Hub
- 查阅技术文档
- Stack Overflow

</td>
<td width="50%">

### 🌍 内容访问
- YouTube / Netflix
- Twitter / Instagram
- Telegram / Discord
- 国际新闻媒体

</td>
</tr>
</table>

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
- ✅ **用户管理** - 添加/删除用户，到期时间管理
- ✅ **在线监控** - 实时查看活跃用户和连接
- ✅ **订阅链接** - 内置订阅服务，客户端自动更新
- ✅ **Telegram 通知** - 流量超限/到期/异常自动推送
- ✅ **定时任务** - 到期检查、配额执行、月度重置
- ✅ **REST API** - 内置 HTTP API 供外部系统集成

</td>
<td width="50%">

### 📱 客户端特性
- ✅ **分享链接** - 自动生成 VLESS URL
- ✅ **订阅服务** - 标准订阅格式，支持 V2RayN/Clash
- ✅ **二维码** - 扫码快速导入
- ✅ **全平台** - 主流系统全覆盖
- ✅ **多协议** - 兼容 v2ray 生态

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

### 📋 系统要求

<details>
<summary><b>点击查看详细配置要求</b></summary>

<table>
<tr>
<td width="50%">

**最低配置**
- 操作系统: Linux (见下方支持列表)
- 内存: 512 MB RAM
- 存储: 100 MB 可用空间
- 网络: 公网 IP 地址

</td>
<td width="50%">

**推荐配置**
- 操作系统: Ubuntu 22.04 LTS / Debian 12
- 内存: 1 GB RAM
- CPU: 1 核心
- 带宽: 10 Mbps+

</td>
</tr>
</table>

**支持的操作系统**

| 发行版 | 最低版本 | 状态 |
|--------|----------|------|
| Ubuntu / Debian / Kali | 22.04 / 11 / 2023+ | ✅ 完全支持 |
| CentOS Stream / AlmaLinux / Rocky | 9 | ✅ 完全支持 |
| Fedora / Amazon Linux | 39 / 2023 | ✅ 完全支持 |

</details>

### ⚡ 一键安装

选择适合你的安装方式（推荐方式一）：

<table>
<tr>
<td width="33%">

**方式一：直接安装**
```bash
wget https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

</td>
<td width="33%">

**方式二：加速安装**
```bash
# 国内服务器推荐
wget https://ghproxy.com/https://raw.githubusercontent.com/DanOps-1/Xray-VPN-OneClick/main/scripts/install.sh -O xray-install.sh
sudo bash xray-install.sh
```

</td>
<td width="33%">

**方式三：克隆仓库**
```bash
git clone https://github.com/DanOps-1/Xray-VPN-OneClick.git
cd Xray-VPN-OneClick/scripts
sudo bash install.sh
```

</td>
</tr>
</table>

安装完成后，脚本会自动输出服务器信息和客户端配置，**请妥善保存**。

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

### 🎯 Clash 客户端支持

本项目完全适配 **[Clash Verge Rev](https://github.com/clash-verge-rev/clash-verge-rev)** - 一款现代化的跨平台 Clash 客户端！

**为什么选择 Clash Verge Rev？**
- ✅ 跨平台支持（Windows、macOS、Linux）
- ✅ 现代化的图形界面，易于使用
- ✅ 完整支持 VLESS + Reality 协议
- ✅ 内置规则管理和订阅功能
- ✅ 开源免费，持续更新维护

**使用方法：**

1. **下载安装 Clash Verge Rev**
   - 访问 [GitHub Releases](https://github.com/clash-verge-rev/clash-verge-rev/releases) 下载对应平台版本

2. **生成 Clash 配置文件**
   ```bash
   # 使用 CLI 工具生成
   xray-manager
   # 选择 "用户管理" -> "生成 Clash 配置"

   # 或使用命令行直接生成
   xray-manager clash --link <你的VLESS链接>
   ```

3. **导入配置到 Clash Verge Rev**
   - 打开 Clash Verge Rev
   - 点击 "配置" -> "导入"
   - 选择生成的 `clash-config.yaml` 文件
   - 启用配置并连接

> 💡 **提示**: 生成的 Clash 配置文件完全兼容 Clash Meta 内核，支持所有 Reality 特性。

### 快速导入配置

**方式一：使用分享链接（推荐）**

1. 复制安装脚本输出的 VLESS 分享链接
2. 打开客户端应用
3. 选择"从剪贴板导入"或"扫描二维码"
4. 连接并开始使用

**方式二：使用 Clash 配置文件**

1. 使用 CLI 工具生成 Clash 配置
2. 导入到 Clash Verge Rev 或其他 Clash 客户端
3. 启用配置并连接

**方式三：手动配置**

查看详细教程：[客户端配置指南](docs/client-setup.md)

---

## 🛠️ 服务管理

### 🎯 交互式 CLI 工具（推荐）

#### 📦 安装 Node.js 和 npm（如果尚未安装）

CLI 工具需要 Node.js 18+ 和 npm。如果你的系统还没有安装，请先执行：

<details>
<summary><b>Ubuntu / Debian / Kali</b></summary>

```bash
# 使用 NodeSource 仓库安装最新 LTS 版本
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应显示 v18.x 或更高
npm --version   # 应显示 9.x 或更高
```

</details>

<details>
<summary><b>CentOS / RHEL / Fedora / AlmaLinux / Rocky</b></summary>

```bash
# 使用 NodeSource 仓库安装最新 LTS 版本
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node --version  # 应显示 v18.x 或更高
npm --version   # 应显示 9.x 或更高
```

</details>

<details>
<summary><b>使用 nvm（推荐，适用于所有 Linux 发行版）</b></summary>

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc  # 或 source ~/.zshrc

# 安装 Node.js LTS
nvm install --lts
nvm use --lts

# 验证安装
node --version
npm --version
```

</details>

#### 🚀 安装 CLI 工具

安装 Node.js 后，使用以下命令安装 CLI 工具：

```bash
# 全局安装 CLI 工具
npm install -g xray-manager

# 启动交互式菜单
xray-manager
# 或使用简短别名
xm
```

> 💡 **提示**: 也可以使用 `npx xray-manager` 无需安装直接运行（需要 npm）

#### 🎨 主要功能

| 功能模块 | 说明 |
|---------|------|
| 📊 **实时仪表盘** | 服务状态、流量统计、CPU/内存/磁盘监控、在线用户数 |
| 👥 **用户管理** | 添加/删除用户、到期时间、分享链接、到期自动禁用 |
| 📡 **在线监控** | 实时检测活跃用户（基于 Xray Stats API 流量差值） |
| 📊 **流量配额** | 设置配额、流量预警、超额自动禁用、定时重置 |
| 🔗 **订阅服务** | 内置 HTTP 订阅服务器，每用户独立订阅 URL |
| 📢 **Telegram 通知** | 流量超限/用户到期/服务异常自动推送 |
| ⏰ **定时任务** | 到期检查、配额执行、月度流量重置 |
| ⚙️ **配置管理** | 备份/恢复配置 |
| 📝 **日志查看** | 访问/错误日志，Follow 模式 |
| 🔌 **REST API** | 内置 HTTP API，Bearer Token 认证，支持外部集成 |

<details>
<summary><b>查看详细功能列表</b></summary>

**React+Ink 终端 UI** ⭐ NEW
- 基于 React+Ink 的现代终端界面
- 键盘驱动导航（j/k/Enter/Esc/q）
- 模糊搜索命令面板（/ 键触发）
- 中英文双语切换
- 深色/浅色主题

**实时仪表盘**
- 服务状态、运行时长
- 流量统计（上行/下行）
- CPU / 内存 / 磁盘使用率（迷你进度条）
- 在线用户数

**用户管理**
- 添加用户（自动 UUID + 可选到期天数）
- 删除用户（确认对话框）
- 用户到期时间管理（自动禁用过期用户）
- 分享链接生成

**在线用户监控** ⭐ NEW
- 基于 Xray Stats API 流量差值检测活跃用户
- TCP 连接统计（ss 解析）
- 5 秒自动刷新
- 显示每用户上行/下行累计流量

**订阅链接服务** ⭐ NEW
- 内置轻量 HTTP 订阅服务器（零依赖）
- 每用户独立订阅 URL（Token 认证）
- 支持 V2RayN / Clash 客户端自动更新
- 可启停、可刷新 Token

**Telegram 通知** ⭐ NEW
- 流量达 80%/100% 自动告警
- 用户到期提醒（3天前、当天、已过期）
- 服务异常/恢复通知
- 用户创建/删除通知
- 每日流量摘要（可选）

**定时任务** ⭐ NEW
- 到期检查（每小时）
- 配额执行（每 10 分钟）
- 月度流量重置（每月 1 号）
- 可配置启用/禁用各任务

**REST API** ⭐ NEW
- 原生 HTTP API（零外部依赖）
- Bearer Token 认证
- 用户 CRUD、配额管理、服务控制、系统监控
- 订阅链接服务集成

**流量配额管理**
- 预设配额（1/5/10/50/100 GB）或自定义
- 流量进度条（绿/黄/红三色阈值）
- 超额自动禁用
- 重置流量、重新启用用户

**配置管理**
- 查看当前 Xray 配置摘要
- 创建备份 / 从备份恢复

**日志查看**
- 访问日志 / 错误日志 Tab 切换
- Follow 模式（实时跟踪）
- 滚动浏览、自动刷新

</details>

#### 终端兼容性 🌍

<details>
<summary><b>查看终端兼容性详情</b></summary>

CLI 工具支持多种终端环境，自动适配不同系统：

**支持的终端**
- ✅ 现代终端: xterm, iTerm2, GNOME Terminal, Konsole（Unicode + 彩色）
- ✅ Windows CMD: 完全兼容（纯 ASCII 文本图标）
- ✅ SSH 会话: 自动检测并适配远程终端
- ✅ 传统终端: vt100, dumb terminal（降级到 ASCII）
- ✅ 管道输出: 重定向时自动切换到纯文本 + 时间戳模式

**三种输出模式**

| 模式 | 使用场景 | 特性 |
|------|---------|------|
| **RICH** | 现代终端（默认） | 彩色 + Unicode 图标 + 格式化 |
| **PLAIN_TTY** | 无彩色终端 | ASCII 图标 + 格式化（无彩色） |
| **PIPE** | 管道/日志文件 | 纯文本 + 时间戳 + 结构化输出 |

**终端尺寸推荐**

| 尺寸类型 | 终端大小 | 布局模式 |
|---------|---------|---------|
| **最小** | 60x20 | COMPACT |
| **标准** | 80x24 | STANDARD（推荐） |
| **宽屏** | 120+ 列 | WIDE |

</details>

### 🔧 systemd 原生命令

如果不使用 CLI 工具，也可以直接使用 systemd 命令：

```bash
# 查看服务状态
sudo systemctl status xray

# 启动/停止/重启服务
sudo systemctl start xray
sudo systemctl stop xray
sudo systemctl restart xray

# 查看日志
sudo journalctl -u xray -f        # 实时日志
sudo journalctl -u xray -n 100    # 最近 100 行
```

<details>
<summary><b>查看 Bash 脚本工具</b></summary>

**用户管理脚本**
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

**系统维护脚本**
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

</details>

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
- [开源仓库评审指南](docs/open-source-review.md) - 生成开源成熟度评审报告
- [常见问题解答](docs/installation-guide.md#常见问题) - 常见问题的排查和解决方案
- [性能优化指南](docs/installation-guide.md#性能优化) - 提升服务器性能的建议

---

## 🔒 安全建议

**基本安全措施**

1. ✅ 定期更换密钥（建议每 3-6 个月）
2. ✅ 使用强密码或密钥认证
3. ✅ 配置防火墙，只开放必要端口
4. ✅ 及时更新 Xray 到最新版本
5. ✅ 定期检查日志和备份配置

<details>
<summary><b>查看进阶安全配置</b></summary>

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

</details>

---

## 📊 支持的云平台

本项目已在以下云平台测试通过：

<details>
<summary><b>查看支持的云平台列表</b></summary>

**国外云平台**
- ✅ AWS EC2, Google Cloud Platform, Microsoft Azure
- ✅ DigitalOcean, Vultr, Linode, Hetzner

**国内云平台**
- ✅ 阿里云、腾讯云、华为云

> **注意**: 在国内云平台使用可能面临合规风险，请谨慎选择。

</details>

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

## ⭐ Star History

<a href="https://star-history.com/#DanOps-1/Xray-VPN-OneClick&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=DanOps-1/Xray-VPN-OneClick&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=DanOps-1/Xray-VPN-OneClick&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=DanOps-1/Xray-VPN-OneClick&type=Date" />
 </picture>
</a>

---

## 👥 Contributors

感谢所有为这个项目做出贡献的人！

<a href="https://github.com/DanOps-1/Xray-VPN-OneClick/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=DanOps-1/Xray-VPN-OneClick" />
</a>

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给一个 Star 支持一下！**

**🔄 也欢迎 Fork 和分享给需要的朋友！**

Made with ❤️ by [DanOps-1](https://github.com/DanOps-1)

</div>
