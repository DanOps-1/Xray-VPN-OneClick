#!/bin/bash

# Xray 一键安装脚本
# 支持: Debian/Ubuntu/Kali/CentOS/AlmaLinux/Rocky/Fedora

set -e

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 加载库函数
if [[ -f "$SCRIPT_DIR/lib/detect-os.sh" ]]; then
    source "$SCRIPT_DIR/lib/detect-os.sh"
fi
if [[ -f "$SCRIPT_DIR/lib/detect-env.sh" ]]; then
    source "$SCRIPT_DIR/lib/detect-env.sh"
fi
if [[ -f "$SCRIPT_DIR/lib/package-manager.sh" ]]; then
    source "$SCRIPT_DIR/lib/package-manager.sh"
fi

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
if type detect_os &>/dev/null; then
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
fi

# 检测容器环境
if type detect_container &>/dev/null; then
    detect_container
    if [[ "$ENV_IS_CONTAINER" == "true" ]]; then
        echo ""
        echo "警告: 检测到容器环境 ($ENV_CONTAINER_TYPE)"
        echo "VPN 功能在容器中可能受限。"
        read -p "是否继续安装？[y/N] " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "安装已取消。"
            exit 0
        fi
    fi
fi

# RHEL 系列启用 EPEL
if type enable_epel &>/dev/null && [[ "$OS_FAMILY_TYPE" == "rhel" ]]; then
    echo ""
    echo "[1/5] 配置软件仓库..."
    enable_epel
fi

# 安装 Xray
echo ""
echo "[2/5] 安装 Xray-core..."

# 使用重试机制安装
install_xray() {
    bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
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
# 使用 cut 解析，兼容新旧版本 xray 输出格式
PRIVATE_KEY=$(echo "$KEYS" | grep -i "Private key" | cut -d':' -f2 | tr -d ' ')
PUBLIC_KEY=$(echo "$KEYS" | grep -i "Public key" | cut -d':' -f2 | tr -d ' ')
SHORT_ID=$(openssl rand -hex 8)

# 验证密钥生成成功
if [[ -z "$PRIVATE_KEY" || -z "$PUBLIC_KEY" ]]; then
    echo "错误: 密钥生成失败"
    echo "xray x25519 输出:"
    echo "$KEYS"
    exit 1
fi

echo "UUID: $UUID"
echo "Private Key: $PRIVATE_KEY"
echo "Public Key: $PUBLIC_KEY"
echo "Short ID: $SHORT_ID"

# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me)
echo "服务器 IP: $SERVER_IP"

# 创建配置文件
echo ""
echo "[4/5] 创建配置文件..."
cat > /usr/local/etc/xray/config.json <<EOF
{
  "log": {
    "loglevel": "warning"
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

# 修改服务用户为 root
sed -i 's/User=nobody/User=root/' /etc/systemd/system/xray.service

# 启动服务
echo ""
echo "[5/5] 启动 Xray 服务..."
systemctl daemon-reload
systemctl enable xray
systemctl restart xray

# 等待服务启动
sleep 2

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
  echo "❌ Xray 启动失败，请检查日志："
  echo "journalctl -u xray -n 50"
  exit 1
fi
