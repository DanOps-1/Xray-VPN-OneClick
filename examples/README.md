# 配置示例

本目录包含 Xray 的各种配置示例。

## 文件说明

- `config.json` - 基础 VLESS + Reality 配置模板
- `config-multiple-users.json` - 多用户配置示例

## 使用方法

1. 复制配置文件到 Xray 配置目录：
   ```bash
   sudo cp config.json /usr/local/etc/xray/config.json
   ```

2. 修改配置文件中的参数：
   - `YOUR-UUID-HERE` - 替换为实际的 UUID
   - `YOUR-PRIVATE-KEY-HERE` - 替换为实际的 Private Key
   - `YOUR-SHORT-ID-HERE` - 替换为实际的 Short ID

3. 测试配置：
   ```bash
   sudo /usr/local/bin/xray run -test -config /usr/local/etc/xray/config.json
   ```

4. 重启服务：
   ```bash
   sudo systemctl restart xray
   ```

## 生成配置参数

```bash
# 生成 UUID
cat /proc/sys/kernel/random/uuid

# 生成密钥对
/usr/local/bin/xray x25519

# 生成 Short ID
openssl rand -hex 8
```

## 注意事项

- 服务端使用 **Private Key**
- 客户端使用 **Public Key**
- Short ID 可以留空或填写生成的值
- SNI 必须与伪装目标网站匹配
