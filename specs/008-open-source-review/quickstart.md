# Quickstart: Open Source Review Recommendations

This quickstart assumes the review feature is implemented in the CLI.

## Prerequisites

- Node.js >= 18
- A local repository path to review

## Build

```bash
cd /home/kali/Xray-VPN-OneClick
npm install
npm run build
```

## Run a review

```bash
node /home/kali/Xray-VPN-OneClick/dist/cli.js review \
  --repo /absolute/path/to/target-repo \
  --format markdown,json \
  --out /absolute/path/to/report.md \
  --json-out /absolute/path/to/report.json
```

## View summary only

```bash
node /home/kali/Xray-VPN-OneClick/dist/cli.js review \
  --repo /absolute/path/to/target-repo \
  --summary
```
