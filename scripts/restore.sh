#!/bin/bash

# Xray 配置恢复脚本
# 用法: bash restore.sh <备份文件>

set -e

CONFIG_FILE="/usr/local/etc/xray/config.json"
BACKUP_DIR="/var/backups/xray"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}错误: 请使用 root 权限运行此脚本${NC}"
  echo "使用命令: sudo bash $0 <备份文件>"
  exit 1
fi

echo "================================"
echo "Xray 配置恢复脚本"
echo "================================"
echo ""

# 获取备份文件
if [ -z "$1" ]; then
  echo -e "${YELLOW}未指定备份文件${NC}"
  echo ""
  echo "可用备份（按时间倒序，最多 10 个）："
  ls -1t "$BACKUP_DIR"/config-*.json 2>/dev/null | head -10 | sed 's/^/  /' || true
  echo ""
  read -p "请输入备份文件路径: " BACKUP_FILE
else
  BACKUP_FILE="$1"
fi

if [ -z "$BACKUP_FILE" ]; then
  echo -e "${RED}错误: 未提供备份文件${NC}"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo -e "${RED}错误: 备份文件不存在: $BACKUP_FILE${NC}"
  exit 1
fi

# 备份当前配置（可回滚）
PRE_RESTORE_BACKUP=""
if [ -f "$CONFIG_FILE" ]; then
  mkdir -p "$BACKUP_DIR"
  PRE_RESTORE_BACKUP="$BACKUP_DIR/config-pre-restore-$(date +%Y%m%d-%H%M%S).json"
  cp "$CONFIG_FILE" "$PRE_RESTORE_BACKUP"
  echo -e "${BLUE}当前配置已备份到: $PRE_RESTORE_BACKUP${NC}"
fi

# 恢复配置
mkdir -p "$(dirname "$CONFIG_FILE")"
cp "$BACKUP_FILE" "$CONFIG_FILE"
echo -e "${GREEN}已恢复配置文件: $CONFIG_FILE${NC}"

# 重启服务
echo "重启 Xray 服务..."
systemctl restart xray
sleep 2

if systemctl is-active --quiet xray; then
  echo -e "${GREEN}✅ Xray 服务重启成功${NC}"
  exit 0
fi

echo -e "${RED}❌ Xray 服务启动失败${NC}"
echo "请查看日志: journalctl -u xray -n 50"

# 尝试回滚
if [ -n "$PRE_RESTORE_BACKUP" ] && [ -f "$PRE_RESTORE_BACKUP" ]; then
  echo -e "${YELLOW}正在回滚到恢复前配置...${NC}"
  cp "$PRE_RESTORE_BACKUP" "$CONFIG_FILE"
  systemctl restart xray || true
  echo -e "${YELLOW}已回滚，请检查配置与服务状态${NC}"
fi

exit 1
