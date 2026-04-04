#!/bin/bash

# Xray 一键安装脚本
# 支持: Debian/Ubuntu/Kali/CentOS/AlmaLinux/Rocky/Fedora
# 版本: 2.0.0

set -e

# ============================================
# 内联的 OS 检测函数 (支持远程下载执行)
# ============================================

# Ensure PATH includes sbin directories
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"

# Supported distributions and minimum versions
declare -A SUPPORTED_DISTROS=(
    ["ubuntu"]="22.04"
    ["debian"]="11"
    ["kali"]="2023"
    ["centos"]="9"
    ["almalinux"]="9"
    ["rocky"]="9"
    ["fedora"]="39"
    ["amzn"]="2023"
)

# OS family mapping
declare -A OS_FAMILY=(
    ["ubuntu"]="debian"
    ["debian"]="debian"
    ["kali"]="debian"
    ["centos"]="rhel"
    ["almalinux"]="rhel"
    ["rocky"]="rhel"
    ["fedora"]="rhel"
    ["amzn"]="rhel"
)

# Package manager mapping
declare -A PKG_MANAGER=(
    ["debian"]="apt"
    ["rhel"]="dnf"
)

# Global variables
OS_ID=""
OS_VERSION=""
OS_VERSION_ID=""
OS_FAMILY_TYPE=""
OS_PKG_MANAGER=""
OS_PRETTY_NAME=""

# Detect operating system from /etc/os-release
detect_os() {
    OS_ID=""
    OS_VERSION=""
    OS_VERSION_ID=""
    OS_FAMILY_TYPE=""
    OS_PKG_MANAGER=""
    OS_PRETTY_NAME=""

    if [[ -e /etc/os-release ]]; then
        source /etc/os-release
        OS_ID="${ID,,}"  # lowercase
        OS_VERSION="$VERSION"
        OS_VERSION_ID="$VERSION_ID"
        OS_PRETTY_NAME="$PRETTY_NAME"
    elif [[ -e /etc/almalinux-release ]]; then
        OS_ID="almalinux"
        OS_VERSION_ID=$(grep -oE '[0-9]+\.[0-9]+' /etc/almalinux-release | head -1)
    elif [[ -e /etc/rocky-release ]]; then
        OS_ID="rocky"
        OS_VERSION_ID=$(grep -oE '[0-9]+\.[0-9]+' /etc/rocky-release | head -1)
    elif [[ -e /etc/centos-release ]]; then
        OS_ID="centos"
        OS_VERSION_ID=$(grep -oE '[0-9]+' /etc/centos-release | head -1)
    elif [[ -e /etc/fedora-release ]]; then
        OS_ID="fedora"
        OS_VERSION_ID=$(grep -oE '[0-9]+' /etc/fedora-release | head -1)
    elif [[ -e /etc/debian_version ]]; then
        OS_ID="debian"
        OS_VERSION_ID=$(cat /etc/debian_version)
    fi

    # Set OS family and package manager
    if [[ -n "${OS_FAMILY[$OS_ID]}" ]]; then
        OS_FAMILY_TYPE="${OS_FAMILY[$OS_ID]}"
        OS_PKG_MANAGER="${PKG_MANAGER[$OS_FAMILY_TYPE]}"
    fi

    # Return success if OS was detected
    [[ -n "$OS_ID" ]]
}

# Check if the detected OS is supported
is_os_supported() {
    [[ -n "${SUPPORTED_DISTROS[$OS_ID]}" ]]
}

# Get minimum supported version for current OS
get_min_version() {
    echo "${SUPPORTED_DISTROS[$OS_ID]:-}"
}

# Compare version numbers (returns 0 if v1 >= v2)
version_ge() {
    local v1="$1" v2="$2"
    [[ "$(printf '%s\n%s' "$v1" "$v2" | sort -V | head -n1)" == "$v2" ]]
}

# Check if current OS version meets minimum requirement
check_version_requirement() {
    local min_version
    min_version=$(get_min_version)
    [[ -z "$min_version" ]] && return 1
    version_ge "$OS_VERSION_ID" "$min_version"
}

# Print error for unsupported OS
print_unsupported_os_error() {
    echo ""
    echo "❌ 错误: 不支持的操作系统"
    echo "========================================"
    echo "检测到: ${OS_PRETTY_NAME:-$OS_ID $OS_VERSION_ID}"
    echo ""
    echo "支持的系统:"
    echo "  - Ubuntu 22.04+"
    echo "  - Debian 11+"
    echo "  - Kali Linux 2023+"
    echo "  - CentOS Stream 9+"
    echo "  - AlmaLinux 9+"
    echo "  - Rocky Linux 9+"
    echo "  - Fedora 39+"
    echo "  - Amazon Linux 2023+"
    echo "========================================"
    echo ""
}

# Print error for version too low
print_version_too_low_error() {
    local min_version
    min_version=$(get_min_version)
    echo ""
    echo "❌ 错误: 系统版本过低"
    echo "========================================"
    echo "检测到: ${OS_PRETTY_NAME:-$OS_ID $OS_VERSION_ID}"
    echo "最低要求: $OS_ID $min_version+"
    echo ""
    echo "请升级您的系统后重试。"
    echo "========================================"
    echo ""
}

# ============================================
# 内联的包管理器函数
# ============================================

# Install packages using the appropriate package manager
pkg_install() {
    case "$OS_PKG_MANAGER" in
        apt)
            apt-get update -qq
            apt-get install -y "$@"
            ;;
        dnf)
            dnf install -y "$@"
            ;;
        yum)
            yum install -y "$@"
            ;;
        *)
            echo "错误: 未知的包管理器"
            return 1
            ;;
    esac
}

# Enable EPEL repository for RHEL-based systems
enable_epel() {
    if [[ "$OS_FAMILY_TYPE" == "rhel" && "$OS_ID" != "fedora" && "$OS_ID" != "amzn" ]]; then
        if ! rpm -q epel-release &>/dev/null; then
            echo "启用 EPEL 仓库..."
            dnf install -y epel-release || true
        fi
    fi
}

# ============================================
# 内联的环境检测函数
# ============================================

ENV_IS_CONTAINER="false"
ENV_CONTAINER_TYPE=""

detect_container() {
    ENV_IS_CONTAINER="false"
    ENV_CONTAINER_TYPE=""

    # Check for Docker
    if [[ -f /.dockerenv ]]; then
        ENV_IS_CONTAINER="true"
        ENV_CONTAINER_TYPE="docker"
        return 0
    fi

    # Check cgroup for container hints
    if grep -qE '(docker|lxc|kubepods)' /proc/1/cgroup 2>/dev/null; then
        ENV_IS_CONTAINER="true"
        if grep -q docker /proc/1/cgroup 2>/dev/null; then
            ENV_CONTAINER_TYPE="docker"
        elif grep -q lxc /proc/1/cgroup 2>/dev/null; then
            ENV_CONTAINER_TYPE="lxc"
        else
            ENV_CONTAINER_TYPE="unknown"
        fi
        return 0
    fi

    # Check for OpenVZ
    if [[ -d /proc/vz && ! -d /proc/bc ]]; then
        ENV_IS_CONTAINER="true"
        ENV_CONTAINER_TYPE="openvz"
        return 0
    fi

    # Not a container - return success (0) to avoid set -e exit
    return 0
}

# ============================================
# 主安装逻辑
# ============================================

echo "================================"
echo "Xray VLESS+Reality 一键安装脚本"
echo "================================"
echo ""

# 检查 shell 兼容性
if [[ -e /proc/$$/exe ]] && readlink /proc/$$/exe | grep -q "dash"; then
    echo "错误: 请使用 bash 运行此脚本"
    echo "使用命令: bash $0"
    exit 1
fi

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
  echo "请使用 root 权限运行此脚本"
  echo "使用命令: sudo bash $0"
  exit 1
fi

# 检测操作系统
echo "[0/5] 检测系统环境..."
detect_os
echo "检测到: ${OS_PRETTY_NAME:-$OS_ID $OS_VERSION_ID}"
echo "系统家族: $OS_FAMILY_TYPE | 包管理器: $OS_PKG_MANAGER"

# 检查是否支持
if ! is_os_supported; then
    print_unsupported_os_error
    exit 1
fi

# 检查版本要求
if ! check_version_requirement; then
    print_version_too_low_error
    exit 1
fi

echo "✓ 系统检测通过"

# 检测容器环境
detect_container
if [[ "$ENV_IS_CONTAINER" == "true" ]]; then
    echo ""
    echo "⚠️  警告: 检测到容器环境 ($ENV_CONTAINER_TYPE)"
    echo "VPN 功能在容器中可能受限。"
    read -p "是否继续安装？[y/N] " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "安装已取消。"
        exit 0
    fi
fi

# RHEL 系列启用 EPEL
if [[ "$OS_FAMILY_TYPE" == "rhel" ]]; then
    echo ""
    echo "[1/5] 配置软件仓库..."
    enable_epel
fi

# 安装依赖
echo ""
echo "[1.5/5] 安装依赖..."
case "$OS_PKG_MANAGER" in
    apt)
        apt-get update -qq
        apt-get install -y curl unzip openssl
        ;;
    dnf)
        # Amazon Linux 2023 使用 curl-minimal，与 curl 冲突
        # 只安装缺失的包
        if [[ "$OS_ID" == "amzn" ]]; then
            dnf install -y unzip openssl || true
        else
            dnf install -y curl unzip openssl
        fi
        ;;
esac

# 安装 Xray
echo ""
echo "[2/5] 安装 Xray-core..."

# 检查是否需要强制重装（如果服务文件不存在）
FORCE_INSTALL=""
if [[ ! -f /etc/systemd/system/xray.service ]] && [[ ! -f /etc/systemd/system/xray@.service ]]; then
    echo "检测到 systemd 服务文件缺失，将强制重新安装..."
    FORCE_INSTALL="--force"
fi

# 使用重试机制安装
install_xray() {
    bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install $FORCE_INSTALL
}

MAX_RETRIES=3
RETRY_COUNT=0
while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    if install_xray; then
        break
    fi
    ((RETRY_COUNT++))
    if [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; then
        echo "安装失败，等待 5 秒后重试 ($RETRY_COUNT/$MAX_RETRIES)..."
        sleep 5
    else
        echo "错误: Xray 安装失败，已达到最大重试次数"
        exit 1
    fi
done

# 生成配置参数
echo ""
echo "[3/5] 生成配置参数..."
UUID=$(cat /proc/sys/kernel/random/uuid)
KEYS=$(/usr/local/bin/xray x25519)

# 兼容新旧版本 xray x25519 输出格式
# 旧版: "Private key: xxx" / "Public key: xxx"
# 新版 v25+: "PrivateKey: xxx" / "PublicKey: xxx"
# 新版 v26+: "PrivateKey: xxx" / "Password (PublicKey): xxx"
PRIVATE_KEY=$(echo "$KEYS" | grep -iE "^Private\s*key:" | cut -d':' -f2 | tr -d ' ')
PUBLIC_KEY=$(echo "$KEYS" | grep -iE "^Public\s*key:" | cut -d':' -f2 | tr -d ' ')

# 如果旧格式解析失败，尝试新格式
if [[ -z "$PRIVATE_KEY" ]]; then
    PRIVATE_KEY=$(echo "$KEYS" | grep -E "^PrivateKey:" | cut -d':' -f2 | tr -d ' ')
fi
if [[ -z "$PUBLIC_KEY" ]]; then
    # v25+ 使用 PublicKey 字段
    PUBLIC_KEY=$(echo "$KEYS" | grep -E "^PublicKey:" | cut -d':' -f2 | tr -d ' ')
fi
if [[ -z "$PUBLIC_KEY" ]]; then
    # v26+ 使用 "Password (PublicKey): xxx" 格式
    PUBLIC_KEY=$(echo "$KEYS" | grep -E "^Password" | awk -F': ' '{print $NF}' | tr -d ' ')
fi
SHORT_ID=$(openssl rand -hex 8)

# 验证密钥生成成功
if [[ -z "$PRIVATE_KEY" || -z "$PUBLIC_KEY" ]]; then
    echo "❌ 错误: 密钥生成失败"
    echo "xray x25519 输出:"
    echo "$KEYS"
    exit 1
fi

echo "UUID: $UUID"
echo "Private Key: $PRIVATE_KEY"
echo "Public Key: $PUBLIC_KEY"
echo "Short ID: $SHORT_ID"

# 获取服务器 IP
SERVER_IP=$(curl -s --connect-timeout 5 ifconfig.me || curl -s --connect-timeout 5 ip.sb || curl -s --connect-timeout 5 ipinfo.io/ip)
if [[ -z "$SERVER_IP" ]]; then
    echo "⚠️  无法自动获取公网 IP"
    read -p "请手动输入服务器公网 IP: " SERVER_IP
fi
echo "服务器 IP: $SERVER_IP"

# 创建配置文件
echo ""
echo "[4/5] 创建配置文件..."

# 确保配置目录和日志目录存在
mkdir -p /usr/local/etc/xray
mkdir -p /var/log/xray

# 检测内核版本，判断是否支持 TCP Fast Open
KERNEL_VERSION=$(uname -r | cut -d. -f1-2)
ENABLE_TCP_OPTIMIZATIONS=false

# TCP Fast Open 需要内核 >= 3.7
if printf '%s\n%s' "3.7" "$KERNEL_VERSION" | sort -C -V 2>/dev/null; then
    ENABLE_TCP_OPTIMIZATIONS=true
    echo "✓ 检测到内核版本 $KERNEL_VERSION，启用 TCP 性能优化"
else
    echo "⚠️  内核版本 $KERNEL_VERSION < 3.7，跳过 TCP Fast Open 优化"
fi

cat > /usr/local/etc/xray/config.json <<EOF
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/xray/access.log",
    "error": "/var/log/xray/error.log"
  },
  "inbounds": [
    {
      "port": 443,
      "protocol": "vless",
      "tag": "vless_tls",
      "settings": {
        "clients": [
          {
            "id": "$UUID",
            "flow": "xtls-rprx-vision",
            "email": "user@example.com"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "www.microsoft.com:443",
          "xver": 0,
          "serverNames": [
            "www.microsoft.com"
          ],
          "privateKey": "$PRIVATE_KEY",
          "shortIds": [
            "$SHORT_ID",
            ""
          ]
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "block"
    }
  ],
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [
      {
        "type": "field",
        "ip": [
          "geoip:private"
        ],
        "outboundTag": "block"
      }
    ]
  }
}
EOF

# 根据内核版本添加 TCP 性能优化
if [ "$ENABLE_TCP_OPTIMIZATIONS" = true ]; then
    echo "✓ 添加 TCP 性能优化参数到配置文件..."

    # 使用 jq 添加 sockopt 到 inbound streamSettings
    jq '.inbounds[0].streamSettings.sockopt = {
        "tcpFastOpen": true,
        "tcpNoDelay": true,
        "tcpKeepAliveInterval": 30
    }' /usr/local/etc/xray/config.json > /tmp/xray-config-tmp.json && \
    mv /tmp/xray-config-tmp.json /usr/local/etc/xray/config.json

    # 使用 jq 添加 sockopt 到 outbound streamSettings
    jq '.outbounds[0].streamSettings = {
        "sockopt": {
            "tcpFastOpen": true,
            "tcpNoDelay": true
        }
    }' /usr/local/etc/xray/config.json > /tmp/xray-config-tmp.json && \
    mv /tmp/xray-config-tmp.json /usr/local/etc/xray/config.json

    echo "✓ TCP 性能优化已启用 (TCP Fast Open, TCP NoDelay, TCP KeepAlive)"
fi

# 确保日志目录和文件存在，并设置正确的权限
mkdir -p /var/log/xray
touch /var/log/xray/access.log /var/log/xray/error.log
chmod 755 /var/log/xray
chmod 666 /var/log/xray/*.log  # 允许任何用户写入日志文件

# 使用 systemd drop-in 配置覆盖服务用户设置
# 这样可以避免被 Xray 更新覆盖，并且优先级高于默认配置
mkdir -p /etc/systemd/system/xray.service.d
cat > /etc/systemd/system/xray.service.d/99-user-override.conf <<EOF
[Service]
# Override user to root for binding port 443
User=root
EOF
echo "✓ 已配置服务用户为 root"

# 配置防火墙
echo ""
echo "[4.5/5] 配置防火墙..."
if command -v firewall-cmd &>/dev/null && systemctl is-active --quiet firewalld; then
    # firewalld (RHEL/CentOS/Fedora)
    firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    echo "✓ firewalld 已配置"
elif command -v ufw &>/dev/null && ufw status | grep -q "active"; then
    # ufw (Ubuntu/Debian)
    ufw allow 443/tcp 2>/dev/null || true
    echo "✓ ufw 已配置"
elif command -v iptables &>/dev/null; then
    # iptables fallback
    iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true
    echo "✓ iptables 已配置"
else
    echo "⚠️  未检测到防火墙，请手动开放 443 端口"
fi

# 启动服务
echo ""
echo "[5/5] 启动 Xray 服务..."
systemctl daemon-reload
systemctl enable xray
systemctl restart xray

# 等待服务启动
sleep 3

# 检查服务状态
if systemctl is-active --quiet xray; then
  echo ""
  echo "================================"
  echo "✅ Xray 安装成功！"
  echo "================================"
  echo ""
  echo "📋 服务器信息："
  echo "地址: $SERVER_IP"
  echo "端口: 443"
  echo ""
  echo "🔑 客户端配置："
  echo "UUID: $UUID"
  echo "Public Key: $PUBLIC_KEY"
  echo "Short ID: $SHORT_ID"
  echo "SNI: www.microsoft.com"
  echo "Flow: xtls-rprx-vision"
  echo ""
  echo "📱 分享链接："
  SHARE_LINK="vless://${UUID}@${SERVER_IP}:443?encryption=none&flow=xtls-rprx-vision&security=reality&sni=www.microsoft.com&fp=chrome&pbk=${PUBLIC_KEY}&sid=${SHORT_ID}&type=tcp&headerType=none#Xray-Reality"
  echo "$SHARE_LINK"
  echo ""
  echo "配置信息已保存到: /root/xray-info.txt"

  # 保存配置信息
  cat > /root/xray-info.txt <<INFO
Xray 配置信息
生成时间: $(date)
系统: ${OS_PRETTY_NAME:-$OS_ID $OS_VERSION_ID}

服务器信息:
- 地址: $SERVER_IP
- 端口: 443
- 协议: VLESS + XTLS-Reality

客户端配置:
- UUID: $UUID
- Public Key: $PUBLIC_KEY
- Short ID: $SHORT_ID
- SNI: www.microsoft.com
- Flow: xtls-rprx-vision
- Fingerprint: chrome

分享链接:
$SHARE_LINK

服务管理命令:
- 启动: systemctl start xray
- 停止: systemctl stop xray
- 重启: systemctl restart xray
- 状态: systemctl status xray
- 日志: journalctl -u xray -f
INFO

else
  echo ""
  echo "❌ Xray 启动失败"
  echo ""
  echo "请检查以下内容："
  echo "1. 查看日志: journalctl -u xray -n 50"
  echo "2. 检查配置: cat /usr/local/etc/xray/config.json"
  echo "3. 检查端口: ss -tlnp | grep 443"
  echo ""
  echo "常见问题："
  echo "- 端口 443 被占用"
  echo "- 配置文件格式错误"
  echo "- SELinux 阻止 (RHEL系): setenforce 0"
  exit 1
fi
