# Contract: 交互式菜单

**命令**: `xray-manager` (无参数)
**别名**: `xm`
**用户故事**: [US1 - 安装和启动交互式管理工具](../spec.md#user-story-1---安装和启动交互式管理工具-priority-p1)

---

## Description

启动交互式菜单系统，提供图形化的操作选择界面。这是 CLI 工具的默认行为（不带任何参数时）。

---

## Usage

```bash
# 启动交互式菜单
xray-manager

# 或使用简写
xm

# 指定服务名称
xray-manager --service xray

# 指定配置文件
xray-manager --config /path/to/config.json
```

---

## Parameters

### 必需参数
无

### 可选参数

| 参数 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--service <name>` | string | 服务名称 | `xray` |
| `--config <path>` | string | 配置文件路径 | `/usr/local/etc/xray/config.json` |
| `--no-color` | boolean | 禁用颜色输出 | `false` |

---

## Output

### 主菜单界面

```
╔═══════════════════════════════════════════════════════════╗
║                 Xray 服务管理工具 v1.0.0                  ║
╚═══════════════════════════════════════════════════════════╝

? 请选择操作:
  ❯ 📊 查看服务状态
    🚀 启动服务
    🛑 停止服务
    🔄 重启服务
    ───────────────
    👥 用户管理
    ⚙️  配置管理
    📝 查看日志
    ───────────────
    ❌ 退出
```

### 二级菜单 - 用户管理

```
╔═══════════════════════════════════════════════════════════╗
║                      用户管理                             ║
╚═══════════════════════════════════════════════════════════╝

? 请选择操作:
  ❯ 📋 列出所有用户
    ➕ 添加新用户
    ➖ 删除用户
    🔗 查看分享链接
    ← 返回主菜单
```

### 二级菜单 - 配置管理

```
╔═══════════════════════════════════════════════════════════╗
║                      配置管理                             ║
╚═══════════════════════════════════════════════════════════╝

? 请选择操作:
  ❯ 👀 查看当前配置
    💾 备份配置
    📥 恢复配置
    🔧 修改配置项
    ✅ 验证配置
    ← 返回主菜单
```

### 二级菜单 - 日志查看

```
╔═══════════════════════════════════════════════════════════╗
║                      日志查看                             ║
╚═══════════════════════════════════════════════════════════╝

? 请选择操作:
  ❯ 📄 查看最近 100 条日志
    🔴 实时跟踪日志
    🔍 按级别过滤 (错误/警告/信息)
    📅 按时间范围查看
    ← 返回主菜单
```

---

## Behavior (行为规范)

### 1. 启动检查
在显示菜单前，执行以下检查：

```typescript
// 伪代码
async function preflightChecks() {
  // 1. 检查 systemd 可用性
  if (!isSystemdAvailable()) {
    console.error('❌ 错误：此系统未使用 systemd');
    console.error('本工具需要支持 systemd 的 Linux 发行版');
    process.exit(1);
  }

  // 2. 检查 Xray 是否安装
  if (!isXrayInstalled()) {
    console.warn('⚠️  警告：未检测到 Xray 安装');
    const shouldInstall = await confirm({
      message: '是否现在安装 Xray？',
      default: true
    });
    if (shouldInstall) {
      await installXray();
    } else {
      console.log('提示：部分功能可能不可用');
    }
  }

  // 3. 检查配置文件
  if (!configFileExists()) {
    console.warn('⚠️  警告：配置文件不存在');
    const shouldCreate = await confirm({
      message: '是否创建默认配置？',
      default: true
    });
    if (shouldCreate) {
      await createDefaultConfig();
    }
  }
}
```

### 2. 菜单导航
- **上下箭头**: 选择菜单项
- **回车键**: 确认选择
- **Ctrl+C**: 随时退出（显示确认提示）
- **← (左箭头)**: 返回上级菜单（在二级菜单中）

### 3. 上下文信息显示
在菜单顶部显示关键状态信息：

```
╔═══════════════════════════════════════════════════════════╗
║  Xray 服务管理工具 v1.0.0  |  服务: 🟢 运行中  |  用户: 3  ║
╚═══════════════════════════════════════════════════════════╝
```

### 4. 操作反馈
每个操作执行后显示结果，并提供"按任意键返回"提示：

```
✅ 服务重启成功
   中断时间: 6.2 秒

Press any key to continue...
```

### 5. 错误处理
捕获所有异常并友好显示：

```
❌ 操作失败: 权限被拒绝

💡 建议:
   请使用 root 权限运行: sudo xray-manager

Press any key to continue...
```

---

## Exit Behavior (退出行为)

### 正常退出
```
👋 感谢使用 Xray 服务管理工具！
```

退出代码: `0`

### 用户中断 (Ctrl+C)
```
^C
? 确定要退出吗？ (y/N)
```

- 选择 `Y`: 退出，代码 `130`
- 选择 `N`: 返回菜单

---

## Interactive Prompts (交互式提示示例)

### 1. 添加用户
```
╔═══════════════════════════════════════════════════════════╗
║                      添加新用户                           ║
╚═══════════════════════════════════════════════════════════╝

? 请输入用户邮箱或标识符: user@example.com
? 是否使用流控 (xtls-rprx-vision)? (Y/n) y
? 立即重启服务使用户生效? (Y/n) y

⏳ 正在添加用户...
✅ 用户添加成功！

用户信息:
  邮箱:   user@example.com
  UUID:   1234****-****-****-****-********qrst  [按 C 复制完整 UUID]
  流控:   xtls-rprx-vision
  创建时间: 2026-01-07 10:30:45

🔄 正在重启服务...
⏱️  预计中断时间: 5-10 秒
✅ 服务重启成功（中断时间: 6.2 秒）

Press any key to continue...
```

### 2. 查看服务状态
```
╔═══════════════════════════════════════════════════════════╗
║                      服务状态                             ║
╚═══════════════════════════════════════════════════════════╝

服务名称: xray
状态:     🟢 运行中 (active)
子状态:   running
进程 ID:  12345
运行时长: 2天 3小时 15分钟
内存占用: 45.2 MB
重启次数: 0
开机自启: 已启用

最近日志 (最后 5 条):
  [2026-01-07 10:28:15] Xray 1.8.7 started
  [2026-01-07 10:28:15] VLESS inbound listening on :443
  [2026-01-07 10:28:20] New connection from 192.168.1.100
  [2026-01-07 10:29:30] Connection closed (duration: 70s, bytes: 1.2MB)
  [2026-01-07 10:30:00] Active connections: 3

Press any key to continue...
```

### 3. 脱敏显示和复制（符合 CR-001）
```
╔═══════════════════════════════════════════════════════════╗
║                  用户分享信息                             ║
╚═══════════════════════════════════════════════════════════╝

用户: user@example.com

配置信息:
  UUID:        1234****-****-****-****-********qrst  [C: 复制完整]
  服务器地址:   vpn.example.com
  端口:        443
  协议:        VLESS
  加密:        Reality
  Public Key:  abcd****************************wxyz  [C: 复制完整]
  Short ID:    1234****abcd  [C: 复制完整]

分享链接:     vless://****************************  [C: 复制完整]

? 操作选项:
  ❯ 📋 复制 UUID
    🔑 复制 Public Key
    🆔 复制 Short ID
    🔗 复制分享链接
    📱 显示二维码
    ← 返回

[提示: 按 C 键快速复制对应项]
```

按 `C` 键后：
```
✅ 已复制到剪贴板
```

---

## Accessibility (可访问性)

### 键盘导航
- 完全支持键盘操作，无需鼠标
- 所有菜单项可通过上下箭头选择
- 快捷键支持（如 `C` 复制）

### 颜色提示
- 使用 Emoji 作为辅助视觉提示
- 支持 `--no-color` 选项禁用颜色

### 终端兼容性
- 支持标准 ANSI 转义序列的终端
- 在不支持颜色的终端中优雅降级

---

## Performance Requirements (性能要求)

| 指标 | 要求 | 对应成功标准 |
|------|------|-------------|
| 菜单启动时间 | < 500ms | SC-003 |
| 菜单切换延迟 | < 100ms | SC-002 |
| 按键响应时间 | < 50ms | SC-002 |
| 状态刷新间隔 | 2 秒 | - |

---

## Error Scenarios (错误场景)

### 1. systemd 不可用
```
❌ 错误：此系统未使用 systemd

本工具需要支持 systemd 的 Linux 发行版。

支持的发行版:
  - Debian 10+
  - Ubuntu 20.04+
  - CentOS 8+
  - Kali Linux

退出代码: 1
```

### 2. 权限不足
```
❌ 错误：权限被拒绝

此操作需要 root 权限。

💡 解决方案:
   使用 sudo 运行: sudo xray-manager

退出代码: 4
```

### 3. 配置文件损坏
```
❌ 错误：配置文件解析失败

文件: /usr/local/etc/xray/config.json
错误: Unexpected token } in JSON at position 234

💡 建议:
   1. 验证 JSON 语法: cat config.json | python -m json.tool
   2. 从备份恢复: xray-manager config restore
   3. 重新生成配置: xray-manager config reset

退出代码: 3
```

---

## Testing Checklist (测试清单)

### 功能测试
- [ ] 无参数启动显示主菜单
- [ ] 上下箭头正确导航
- [ ] 回车键确认选择
- [ ] Ctrl+C 显示退出确认
- [ ] 所有二级菜单可访问
- [ ] "返回"选项正常工作

### 性能测试
- [ ] 菜单启动时间 < 500ms
- [ ] 菜单切换无明显延迟
- [ ] 按键响应流畅

### 错误处理测试
- [ ] systemd 不可用时正确退出
- [ ] 权限不足时显示提示
- [ ] 配置文件缺失时提供选项
- [ ] 网络错误时友好提示

### 可访问性测试
- [ ] 仅键盘可完成所有操作
- [ ] `--no-color` 选项正常工作
- [ ] Emoji 提示清晰可见

---

## Implementation Notes (实现注意事项)

### 使用的库
- **@inquirer/prompts**: `select`, `confirm`, `input` 提示类型
- **chalk**: 颜色和样式
- **ora**: 加载动画
- **clipboardy**: 剪贴板操作

### 状态管理
```typescript
interface MenuState {
  currentMenu: 'main' | 'user' | 'config' | 'logs';
  previousMenu: string[];  // 菜单历史栈
  serviceStatus: ServiceStatus;  // 缓存的服务状态
  userCount: number;  // 缓存的用户数
}
```

### 菜单栈（用于返回）
```typescript
const menuStack: string[] = [];

function navigateTo(menu: string) {
  menuStack.push(currentMenu);
  currentMenu = menu;
}

function goBack() {
  if (menuStack.length > 0) {
    currentMenu = menuStack.pop();
  }
}
```

---

## Constitution Compliance (宪章合规性)

### ✅ I. 安全第一 (CR-001)
- **敏感信息脱敏**: UUID、密钥默认脱敏显示（前4后4）
- **剪贴板复制**: 提供按键复制功能，避免屏幕泄露

### ✅ II. 简洁易用 (CR-002)
- **直观菜单**: 图形化界面，易于理解
- **双语提示**: 所有提示支持中英文
- **快捷操作**: 常用操作不超过 3 层菜单深度

### ✅ III. 可靠稳定 (CR-003)
- **启动检查**: 预检查 systemd、Xray、配置文件
- **友好错误**: 所有错误提供具体建议
- **状态缓存**: 减少重复查询，提升性能

---

**最后更新**: 2026-01-07
**状态**: ✅ 已完成
