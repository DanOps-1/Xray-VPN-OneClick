# Xray-VPN-OneClick Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-14

## Active Technologies
- TypeScript 5.x + @inquirer/prompts, commander, chalk, cli-table3 (010-traffic-quota-ui)
- JSON 文件 (`/usr/local/etc/xray/quota.json`) (010-traffic-quota-ui)
- TypeScript 5.x + @inquirer/prompts, chalk, ora (已有依赖) (011-auto-stats-api)
- JSON 文件 (`/usr/local/etc/xray/config.json`) (011-auto-stats-api)
- TypeScript 5.9.x (Node.js >= 18.0.0) + @inquirer/prompts, commander, chalk, cli-table3, ora (012-core-features-completion)
- JSON 文件 (`/usr/local/etc/xray/config.json`, `/usr/local/etc/xray/quota.json`, 新增 `server-config.json`, `user-metadata.json`) (012-core-features-completion)

- TypeScript 5.x (CLI), Bash 4.0+ (安装脚本) + Node.js 18+, @inquirer/prompts, commander, chalk (009-cross-platform-support)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (CLI), Bash 4.0+ (安装脚本): Follow standard conventions

## Recent Changes
- 012-core-features-completion: Added TypeScript 5.9.x (Node.js >= 18.0.0) + @inquirer/prompts, commander, chalk, cli-table3, ora
- 011-auto-stats-api: Added TypeScript 5.x + @inquirer/prompts, chalk, ora (已有依赖)
- 010-traffic-quota-ui: Added TypeScript 5.x + @inquirer/prompts, commander, chalk, cli-table3


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
