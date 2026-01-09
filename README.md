# Xray VPN OneClick Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A powerful, interactive CLI tool for managing Xray VPN services on Linux. Simplifies installation, user management, and service monitoring.

## ✨ Features

- **Improved Interactive UI**: Persistent dashboard with service status, system resources, and breadcrumb navigation.
- **Responsive Tables**: Adaptive user lists that look good on terminals of all sizes.
- **One-Click Installation**: Automated setup script for Xray service.
- **User Management**: Add, remove, list users, and generate connection links.
- **Service Control**: Start, stop, restart, and view status of Xray service.
- **Multi-Protocol Support**: VLESS, VMESS, Trojan, Shadowsocks, etc.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the interactive manager
npm start
# or
sudo ./dist/cli.js interactive
```

## Interactive UI

The new interactive interface (v1.3+) features:

- **Dashboard**: Always-on status bar showing Xray service state, uptime, and connected user count.
- **Navigation**: Breadcrumb bar (e.g., `Home > User Management`) to keep track of your location.
- **User Tables**: Adaptive tables that show more details on wider screens and summarize large user lists.

## Development

```bash
# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT