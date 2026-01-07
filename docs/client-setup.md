# Client Setup Guide

Complete guide for configuring Xray clients on all platforms.

---

## 📱 Platform-Specific Guides

- [Windows (v2rayN)](#windows---v2rayn)
- [macOS (V2rayU)](#macos---v2rayu)
- [Linux (v2ray-core)](#linux---v2ray-core)
- [Android (v2rayNG)](#android---v2rayng)
- [iOS (Shadowrocket)](#ios---shadowrocket)

---

## Windows - v2rayN

### Installation

1. Download v2rayN from [GitHub Releases](https://github.com/2dust/v2rayN/releases)
2. Download the latest `v2rayN-windows-64.zip` or `v2rayN-Core.zip`
3. Extract to a folder (e.g., `C:\Program Files\v2rayN`)
4. Run `v2rayN.exe` (may need to run as Administrator)

### Configuration

#### Method 1: Import from Share Link (Recommended)

1. Copy the VLESS share link from your server
2. In v2rayN, click **Servers** → **Import servers from clipboard**
3. The server will be automatically added
4. Right-click the server → **Set as active server**
5. Click **System Proxy** → **Auto configure system proxy**

#### Method 2: Manual Configuration

1. Click **Servers** → **Add [VMess/VLESS] Server**
2. Fill in the configuration:
   ```
   Address: YOUR_SERVER_IP
   Port: 443
   User ID: YOUR_UUID
   Security: none
   Network: tcp
   TLS: reality

   Reality Settings:
   - SNI: www.microsoft.com
   - Public Key: YOUR_PUBLIC_KEY
   - Short ID: YOUR_SHORT_ID
   - Fingerprint: chrome
   ```
3. Click **OK** to save
4. Right-click the server → **Set as active server**

### Verification

1. Enable system proxy
2. Open browser and visit https://ip.sb
3. The IP shown should be your server's IP

### Troubleshooting

**Issue**: Connection failed
- Check if server is running: `systemctl status xray`
- Verify UUID and Public Key are correct
- Try disabling Windows Firewall temporarily

**Issue**: Slow speed
- Try different routing modes in v2rayN settings
- Enable Mux in server settings

---

## macOS - V2rayU

### Installation

1. Download V2rayU from [GitHub Releases](https://github.com/yanue/V2rayU/releases)
2. Open the `.dmg` file and drag V2rayU to Applications
3. Launch V2rayU from Applications
4. Grant necessary permissions when prompted

### Configuration

#### Method 1: Import from Share Link

1. Copy the VLESS share link
2. Click V2rayU icon in menu bar → **Import**
3. Select **Import from Pasteboard**
4. Click **OK** and select the imported server
5. Click **Turn On V2rayU**

#### Method 2: QR Code Import

1. Click V2rayU icon → **Import**
2. Select **Scan QR code from screen**
3. The server will be automatically added

### System Proxy Settings

1. Click V2rayU icon in menu bar
2. Select **Turn On V2rayU**
3. Choose proxy mode:
   - **PAC Mode**: Auto-proxy for blocked sites only
   - **Global Mode**: Route all traffic through proxy
   - **Manual Mode**: Configure manually

### Verification

Open Terminal and run:
```bash
curl ip.sb
```
Should return your server's IP address.

---

## Linux - v2ray-core

### Installation

```bash
# Download latest v2ray-core
wget https://github.com/v2fly/v2ray-core/releases/latest/download/v2ray-linux-64.zip

# Extract
unzip v2ray-linux-64.zip -d v2ray

# Move to /usr/local/bin
sudo mv v2ray/v2ray /usr/local/bin/
sudo mv v2ray/v2ctl /usr/local/bin/
sudo chmod +x /usr/local/bin/v2ray
sudo chmod +x /usr/local/bin/v2ctl
```

### Configuration

Create `/etc/v2ray/config.json`:

```json
{
  "inbounds": [
    {
      "port": 10808,
      "protocol": "socks",
      "settings": {
        "udp": true
      }
    },
    {
      "port": 10809,
      "protocol": "http"
    }
  ],
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "YOUR_SERVER_IP",
            "port": 443,
            "users": [
              {
                "id": "YOUR_UUID",
                "encryption": "none",
                "flow": "xtls-rprx-vision"
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "serverName": "www.microsoft.com",
          "fingerprint": "chrome",
          "publicKey": "YOUR_PUBLIC_KEY",
          "shortId": "YOUR_SHORT_ID"
        }
      }
    }
  ]
}
```

### Running v2ray

```bash
# Start v2ray
sudo v2ray run -c /etc/v2ray/config.json

# Or create systemd service
sudo nano /etc/systemd/system/v2ray.service
```

Service file content:
```ini
[Unit]
Description=V2Ray Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/v2ray run -c /etc/v2ray/config.json
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable v2ray
sudo systemctl start v2ray
```

### System Proxy

Configure browser or system to use:
- SOCKS5: `127.0.0.1:10808`
- HTTP: `127.0.0.1:10809`

---

## Android - v2rayNG

### Installation

1. Download v2rayNG APK from [GitHub Releases](https://github.com/2dust/v2rayNG/releases)
2. Install the APK (enable "Install from Unknown Sources" if needed)
3. Launch v2rayNG

### Configuration

#### Method 1: Import from Share Link

1. Copy the VLESS share link
2. Open v2rayNG
3. Tap **+** (top right) → **Import config from Clipboard**
4. The server will be added automatically
5. Tap the server to select it
6. Tap the connection button at bottom

#### Method 2: Scan QR Code

1. Generate QR code on your computer
2. In v2rayNG, tap **+** → **Scan QR code**
3. Scan the QR code
4. Tap to connect

### Settings

Recommended settings:
- **Routing**: Bypass mainland China (if in China)
- **Domain Strategy**: IPIfNonMatch
- **Enable Mux**: Yes (can improve performance)

### Verification

1. Connect to the server
2. Open browser and visit https://ip.sb
3. Should show your server's IP

---

## iOS - Shadowrocket

### Installation

1. Get Shadowrocket from App Store (requires US Apple ID, paid app ~$2.99)
2. Launch Shadowrocket

### Configuration

#### Method 1: Import from Share Link

1. Copy the VLESS share link
2. Open Shadowrocket
3. Tap **+** (top right)
4. Select **Type** → **Subscribe**
5. Paste the link and save
6. Tap the server to connect

#### Method 2: Manual Configuration

1. Tap **+** → **Add Server**
2. Select **Type** → **VLESS**
3. Fill in details:
   ```
   Address: YOUR_SERVER_IP
   Port: 443
   UUID: YOUR_UUID
   TLS: Yes

   Reality:
   - SNI: www.microsoft.com
   - Public Key: YOUR_PUBLIC_KEY
   - Short ID: YOUR_SHORT_ID
   ```
4. Tap **Done**
5. Toggle switch to connect

### Settings

1. Tap **Global Routing**
2. Choose:
   - **Proxy**: Route all traffic
   - **Config**: Use routing rules
   - **Direct**: Bypass proxy

### Verification

Open Safari and visit https://ip.sb - should show server IP.

---

## 🔧 Common Issues

### Connection Timeout

**Possible causes:**
1. Server is not running
2. Firewall blocking port 443
3. Wrong server IP address

**Solutions:**
```bash
# Check server status
sudo systemctl status xray

# Check if port 443 is listening
sudo ss -tlnp | grep 443

# Check firewall
sudo ufw status
```

### Authentication Failed

**Possible causes:**
1. Wrong UUID
2. Wrong Public Key
3. Mismatched configuration

**Solutions:**
- Verify UUID matches exactly
- Check Public Key (not Private Key!)
- Regenerate configuration if needed

### Slow Connection

**Try:**
1. Enable Mux in client settings
2. Change routing mode
3. Try different SNI (e.g., www.cloudflare.com)
4. Enable BBR on server

### Reality Fingerprint Mismatch

**Solution:**
- Try different fingerprints: chrome, firefox, safari
- Ensure SNI matches the dest in server config

---

## 📊 Performance Tips

### Client-Side Optimization

1. **Enable Mux**
   - Reduces connection overhead
   - May improve latency

2. **Routing Rules**
   - Use PAC mode for selective proxy
   - Bypass local/LAN traffic

3. **DNS Settings**
   - Use 1.1.1.1 or 8.8.8.8
   - Enable DoH in client

### Server-Side Optimization

See [Performance Optimization Guide](installation-guide.md#performance-optimization)

---

## 🆘 Getting Help

- Check [FAQ](installation-guide.md#common-issues)
- Submit [Issue](https://github.com/DanOps-1/X-ray/issues)
- Review server logs: `sudo journalctl -u xray -f`

---

**Back to**: [Main README](../README.md) | [Installation Guide](installation-guide.md)
