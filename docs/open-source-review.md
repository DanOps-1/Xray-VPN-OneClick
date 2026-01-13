# 开源仓库评审指南

本指南介绍如何使用 `review` 命令对本地仓库进行开源成熟度评审，并生成可分享的报告。

## 适用场景

- 维护者希望了解项目在文档、许可、贡献流程、质量、社区与安全等维度的改进点
- 贡献者希望确认项目是否具备明确的贡献路径与社区规范
- 使用者希望快速判断项目可信度与维护状态

## 基础用法

```bash
node /home/kali/Xray-VPN-OneClick/dist/cli.js review \
  --repo /absolute/path/to/target-repo
```

默认输出 Markdown + JSON 到 stdout（如需保存文件请使用 `--out` / `--json-out`）。

## 常用参数

- `--repo <path>`: 必填，本地仓库路径
- `--format <markdown,json>`: 输出格式，默认 `markdown,json`
- `--out <path>`: Markdown 输出文件路径
- `--json-out <path>`: JSON 输出文件路径
- `--summary`: 仅输出摘要
- `--recommendations`: 仅输出推荐清单

## 示例

### 输出 Markdown 与 JSON 文件

```bash
node /home/kali/Xray-VPN-OneClick/dist/cli.js review \
  --repo /absolute/path/to/target-repo \
  --format markdown,json \
  --out /absolute/path/to/report.md \
  --json-out /absolute/path/to/report.json
```

### 仅输出摘要

```bash
node /home/kali/Xray-VPN-OneClick/dist/cli.js review \
  --repo /absolute/path/to/target-repo \
  --summary
```

### 仅输出优化建议

```bash
node /home/kali/Xray-VPN-OneClick/dist/cli.js review \
  --repo /absolute/path/to/target-repo \
  --recommendations
```

## 报告包含的评审维度

- 文档（README、文档目录、使用说明）
- 许可（LICENSE 是否存在、许可类型提示）
- 贡献流程（CONTRIBUTING、模板、行为准则）
- 质量信号（测试、CI、发布记录）
- 社区与维护（维护者说明、路线图）
- 安全（安全披露政策）
