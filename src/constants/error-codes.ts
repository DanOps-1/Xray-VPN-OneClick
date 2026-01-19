/**
 * Unified Error Code Definitions
 * @module constants/error-codes
 *
 * Error code format: E + Category + Number
 * - E1xx: Configuration errors
 * - E2xx: User management errors
 * - E3xx: Quota management errors
 * - E4xx: Service management errors
 * - E5xx: Network errors
 * - E6xx: File operation errors
 * - E7xx: Validation errors
 * - E8xx: VLESS/Protocol parsing errors
 * - E9xx: System/Permission errors
 */

/**
 * Error information details
 */
export interface ErrorInfo {
  /** Error code (e.g., E101) */
  readonly code: string;
  /** Error title (short description) */
  readonly title: string;
  /** Possible causes */
  readonly causes: readonly string[];
  /** Solutions */
  readonly solutions: readonly string[];
}

/**
 * Configuration Errors (E1xx)
 */
export const ConfigErrors = {
  CONFIG_NOT_FOUND: {
    code: 'E101',
    title: '配置文件不存在',
    causes: ['Xray 尚未安装', '配置文件被删除或移动', '路径配置错误'],
    solutions: [
      '运行安装脚本重新安装 Xray',
      '检查配置文件路径: /usr/local/etc/xray/config.json',
      "使用 'xray-vpn config --restore' 从备份恢复",
    ],
  },
  CONFIG_NO_READ_PERMISSION: {
    code: 'E102',
    title: '配置文件无读取权限',
    causes: ['当前用户权限不足', '文件权限设置错误', '未使用 sudo 运行'],
    solutions: [
      "使用 sudo 运行: 'sudo xray-vpn'",
      "检查文件权限: 'ls -la /usr/local/etc/xray/config.json'",
      "修改权限: 'sudo chmod 644 /usr/local/etc/xray/config.json'",
    ],
  },
  CONFIG_NO_WRITE_PERMISSION: {
    code: 'E103',
    title: '配置文件无写入权限',
    causes: ['当前用户权限不足', '文件系统只读', '磁盘空间不足'],
    solutions: ["使用 sudo 运行: 'sudo xray-vpn'", "检查磁盘空间: 'df -h'", '检查文件系统状态'],
  },
  CONFIG_INVALID_JSON: {
    code: 'E104',
    title: '配置文件 JSON 格式错误',
    causes: ['JSON 语法错误', '文件被损坏', '编辑时引入错误'],
    solutions: [
      "使用 JSON 验证工具检查: 'cat config.json | jq .'",
      "从备份恢复: 'xray-vpn config --restore'",
      '手动检查 JSON 语法（引号、逗号、括号匹配）',
    ],
  },
  CONFIG_INVALID_STRUCTURE: {
    code: 'E105',
    title: '配置文件结构无效',
    causes: ['缺少必要字段 (inbounds/outbounds)', 'Xray 版本不兼容', '配置格式过时'],
    solutions: [
      '确保配置包含 inbounds 和 outbounds 数组',
      '参考 Xray 官方文档检查配置格式',
      '使用模板重新生成配置文件',
    ],
  },
  CONFIG_BACKUP_FAILED: {
    code: 'E106',
    title: '配置备份失败',
    causes: ['目标目录不存在', '磁盘空间不足', '权限不足'],
    solutions: ['确保备份目录存在', "检查磁盘空间: 'df -h'", '使用 sudo 运行程序'],
  },
  CONFIG_RESTORE_FAILED: {
    code: 'E107',
    title: '配置恢复失败',
    causes: ['备份文件不存在', '备份文件已损坏', '权限不足'],
    solutions: [
      "列出可用备份: 'xray-vpn config --list-backups'",
      '选择一个有效的备份文件',
      '确保有足够权限写入配置文件',
    ],
  },
} as const;

/**
 * User Management Errors (E2xx)
 */
export const UserErrors = {
  INVALID_EMAIL: {
    code: 'E201',
    title: '邮箱地址格式无效',
    causes: ['邮箱格式不正确', '包含非法字符', '缺少必要部分 (@, 域名)'],
    solutions: [
      '使用标准邮箱格式: user@example.com',
      '确保邮箱只包含字母、数字和允许的特殊字符',
      '检查是否有多余的空格',
    ],
  },
  EMAIL_EXISTS: {
    code: 'E202',
    title: '邮箱地址已存在',
    causes: ['该邮箱已被其他用户使用', '尝试创建重复用户'],
    solutions: [
      "使用 'xray-vpn user list' 查看现有用户",
      '选择一个不同的邮箱地址',
      "如需更新用户，使用 'xray-vpn user update' 命令",
    ],
  },
  USER_NOT_FOUND: {
    code: 'E203',
    title: '用户不存在',
    causes: ['用户已被删除', '邮箱地址输入错误', '用户从未创建'],
    solutions: [
      "使用 'xray-vpn user list' 查看所有用户",
      '检查邮箱地址是否正确（区分大小写）',
      "使用 'xray-vpn user add' 创建新用户",
    ],
  },
  INVALID_UUID: {
    code: 'E204',
    title: 'UUID 格式无效',
    causes: ['UUID 格式不正确', '不是有效的 UUID v4', '复制时丢失部分字符'],
    solutions: [
      'UUID 应为 36 字符格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
      '使用系统生成的 UUID，不要手动编辑',
      "可使用 'uuidgen' 命令生成新 UUID",
    ],
  },
  KEY_GENERATION_FAILED: {
    code: 'E205',
    title: '密钥生成失败',
    causes: ['xray 命令不可用', 'x25519 算法不支持', '系统随机数生成器问题'],
    solutions: [
      "确保 Xray 已正确安装: 'xray version'",
      '检查 Xray 版本是否支持 x25519',
      '重新安装 Xray',
    ],
  },
} as const;

/**
 * Quota Management Errors (E3xx)
 */
export const QuotaErrors = {
  QUOTA_CONFIG_NOT_FOUND: {
    code: 'E301',
    title: '配额配置文件不存在',
    causes: ['配额功能未初始化', '文件被删除', '路径配置错误'],
    solutions: [
      "运行 'xray-vpn quota init' 初始化配额系统",
      '检查文件路径: /usr/local/etc/xray/quota.json',
      '确保 Xray 配置目录存在',
    ],
  },
  INVALID_QUOTA_VALUE: {
    code: 'E302',
    title: '配额值无效',
    causes: ['数值不是有效数字', '数值为负数（非 -1）', '超出允许范围'],
    solutions: [
      '配额值必须为 -1（无限制）或 >= 0 的整数',
      '使用字节为单位或带单位的格式（如 10GB）',
      "设置无限制配额使用 '-1'",
    ],
  },
  USER_QUOTA_NOT_FOUND: {
    code: 'E303',
    title: '用户配额不存在',
    causes: ['用户未设置配额', '用户邮箱错误', '用户已被删除'],
    solutions: [
      "使用 'xray-vpn quota list' 查看所有配额",
      "使用 'xray-vpn quota set <email> <limit>' 设置配额",
      '确认用户邮箱地址正确',
    ],
  },
  TRAFFIC_UPDATE_FAILED: {
    code: 'E304',
    title: '流量统计更新失败',
    causes: ['配额文件写入失败', '并发访问冲突', '数据格式错误'],
    solutions: ['检查配额文件写入权限', '确保没有其他进程正在修改配额文件', '重新初始化配额系统'],
  },
  QUOTA_EXCEEDED: {
    code: 'E305',
    title: '用户流量配额已超限',
    causes: ['用户流量使用超过限制', '配额设置过低'],
    solutions: [
      "使用 'xray-vpn quota set <email> <new_limit>' 增加配额",
      "使用 'xray-vpn quota reset <email>' 重置流量统计",
      '考虑设置无限制配额 (-1)',
    ],
  },
} as const;

/**
 * Service Management Errors (E4xx)
 */
export const ServiceErrors = {
  SERVICE_NOT_RUNNING: {
    code: 'E401',
    title: 'Xray 服务未运行',
    causes: ['服务未启动', '服务启动后崩溃', '配置错误导致启动失败'],
    solutions: [
      "启动服务: 'sudo systemctl start xray'",
      "查看服务状态: 'sudo systemctl status xray'",
      "检查日志: 'sudo journalctl -u xray -n 50'",
    ],
  },
  SERVICE_START_FAILED: {
    code: 'E402',
    title: '服务启动失败',
    causes: ['配置文件错误', '端口被占用', '权限不足'],
    solutions: [
      "验证配置: 'xray run -test -c /usr/local/etc/xray/config.json'",
      "检查端口占用: 'ss -tlnp | grep <port>'",
      "查看详细日志: 'sudo journalctl -u xray -n 100'",
    ],
  },
  SERVICE_STOP_FAILED: {
    code: 'E403',
    title: '服务停止失败',
    causes: ['服务进程僵死', '权限不足', 'systemd 问题'],
    solutions: [
      "强制停止: 'sudo systemctl kill xray'",
      "检查进程: 'ps aux | grep xray'",
      "手动终止: 'sudo kill -9 <pid>'",
    ],
  },
  INVALID_SERVICE_NAME: {
    code: 'E404',
    title: '服务名称无效',
    causes: ['包含非法字符', '路径遍历尝试', '名称为空'],
    solutions: [
      '服务名只能包含字母、数字和 @._- 字符',
      '默认服务名为 "xray"',
      '不要在服务名中使用路径分隔符',
    ],
  },
  SYSTEMD_NOT_AVAILABLE: {
    code: 'E405',
    title: 'systemd 不可用',
    causes: ['系统未使用 systemd', '在容器中运行', 'systemd 服务未启动'],
    solutions: [
      '确保系统使用 systemd 作为 init 系统',
      "检查 systemd 状态: 'systemctl --version'",
      '如在容器中，需手动管理进程',
    ],
  },
} as const;

/**
 * Network Errors (E5xx)
 */
export const NetworkErrors = {
  CONNECTION_REFUSED: {
    code: 'E501',
    title: '连接被拒绝',
    causes: ['目标服务未运行', '端口未开放', '防火墙阻止'],
    solutions: [
      '检查目标服务是否运行',
      "检查防火墙规则: 'sudo ufw status'",
      "开放端口: 'sudo ufw allow <port>'",
    ],
  },
  CONNECTION_TIMEOUT: {
    code: 'E502',
    title: '连接超时',
    causes: ['网络不稳定', '服务器无响应', '防火墙丢弃数据包'],
    solutions: ['检查网络连接', "测试网络: 'ping <server_ip>'", '检查服务器端防火墙设置'],
  },
  PUBLIC_IP_FAILED: {
    code: 'E503',
    title: '无法获取公网 IP',
    causes: ['网络连接问题', 'IP 检测服务不可用', 'DNS 解析失败'],
    solutions: [
      "检查网络连接: 'curl -s https://api.ipify.org'",
      '手动指定服务器 IP 地址',
      '检查 DNS 设置',
    ],
  },
  INVALID_PORT: {
    code: 'E504',
    title: '端口号无效',
    causes: ['端口号超出范围', '端口号不是数字', '使用了保留端口'],
    solutions: [
      '端口号必须在 1-65535 之间',
      '建议使用 1024 以上的端口',
      '确保端口未被其他服务占用',
    ],
  },
  PORT_IN_USE: {
    code: 'E505',
    title: '端口已被占用',
    causes: ['其他程序正在使用该端口', 'Xray 已在运行', '系统服务占用'],
    solutions: [
      "查看端口占用: 'ss -tlnp | grep <port>'",
      '选择其他未使用的端口',
      '停止占用端口的服务后重试',
    ],
  },
} as const;

/**
 * File Operation Errors (E6xx)
 */
export const FileErrors = {
  FILE_NOT_FOUND: {
    code: 'E601',
    title: '文件不存在',
    causes: ['文件已被删除', '路径错误', '从未创建'],
    solutions: ['检查文件路径是否正确', '确认文件是否已创建', '检查父目录是否存在'],
  },
  DIRECTORY_NOT_FOUND: {
    code: 'E602',
    title: '目录不存在',
    causes: ['目录已被删除', '路径错误', '父目录不存在'],
    solutions: ["创建目录: 'mkdir -p <path>'", '检查路径拼写', '确保有创建目录的权限'],
  },
  FILE_READ_FAILED: {
    code: 'E603',
    title: '文件读取失败',
    causes: ['权限不足', '文件被锁定', '文件已损坏'],
    solutions: ['使用 sudo 运行', '检查文件是否被其他进程占用', '检查文件权限设置'],
  },
  FILE_WRITE_FAILED: {
    code: 'E604',
    title: '文件写入失败',
    causes: ['权限不足', '磁盘空间不足', '文件系统只读'],
    solutions: ['使用 sudo 运行', "检查磁盘空间: 'df -h'", '检查文件系统挂载状态'],
  },
} as const;

/**
 * Validation Errors (E7xx)
 */
export const ValidationErrors = {
  REQUIRED_FIELD_EMPTY: {
    code: 'E701',
    title: '必填字段不能为空',
    causes: ['未提供必要的输入', '输入只包含空白字符'],
    solutions: ['请提供所有必填字段的值', '检查输入是否包含有效内容'],
  },
  INVALID_FORMAT: {
    code: 'E702',
    title: '输入格式不正确',
    causes: ['输入不符合预期格式', '包含非法字符'],
    solutions: ['检查输入格式要求', '参考示例输入'],
  },
  VALUE_OUT_OF_RANGE: {
    code: 'E703',
    title: '值超出有效范围',
    causes: ['数值过大或过小', '超出允许的限制'],
    solutions: ['检查允许的值范围', '使用范围内的值重试'],
  },
} as const;

/**
 * VLESS/Protocol Parsing Errors (E8xx)
 */
export const ProtocolErrors = {
  INVALID_VLESS_LINK: {
    code: 'E801',
    title: 'VLESS 链接格式无效',
    causes: ['链接格式不正确', '不是 vless:// 协议', '链接不完整'],
    solutions: ['确保链接以 vless:// 开头', '检查链接是否完整复制', '验证链接来源是否可靠'],
  },
  VLESS_MISSING_UUID: {
    code: 'E802',
    title: 'VLESS 链接缺少 UUID',
    causes: ['链接格式错误', 'UUID 部分被截断'],
    solutions: ['检查链接是否完整', '重新获取正确的分享链接'],
  },
  VLESS_MISSING_HOST: {
    code: 'E803',
    title: 'VLESS 链接缺少服务器地址',
    causes: ['链接格式错误', '服务器地址部分缺失'],
    solutions: ['检查链接格式', '确保包含服务器地址和端口'],
  },
  VLESS_INVALID_PORT: {
    code: 'E804',
    title: 'VLESS 链接端口无效',
    causes: ['端口不是数字', '端口超出范围'],
    solutions: ['端口必须是 1-65535 之间的数字', '检查链接格式是否正确'],
  },
  VLESS_MISSING_REALITY_PBK: {
    code: 'E805',
    title: 'Reality 链接缺少公钥参数',
    causes: ['链接缺少 pbk 参数', 'Reality 配置不完整'],
    solutions: ['Reality 链接必须包含 pbk (公钥) 参数', '重新生成包含完整参数的链接'],
  },
} as const;

/**
 * System/Permission Errors (E9xx)
 */
export const SystemErrors = {
  ROOT_REQUIRED: {
    code: 'E901',
    title: '需要管理员权限',
    causes: ['当前用户不是 root', '未使用 sudo 运行'],
    solutions: ["使用 sudo 运行: 'sudo xray-vpn'", "切换到 root 用户: 'su -'"],
  },
  UNSUPPORTED_OS: {
    code: 'E902',
    title: '不支持的操作系统',
    causes: ['操作系统不兼容', '系统版本过低'],
    solutions: [
      '支持的系统: Ubuntu 18+, Debian 10+, CentOS 7+, Fedora 30+',
      '考虑使用 Docker 容器运行',
    ],
  },
  DEPENDENCY_MISSING: {
    code: 'E903',
    title: '缺少必要的依赖',
    causes: ['系统工具未安装', 'Node.js 版本不兼容'],
    solutions: [
      '运行安装脚本自动安装依赖',
      '确保 Node.js >= 18.0.0',
      "检查 xray 是否安装: 'xray version'",
    ],
  },
  PREFLIGHT_FAILED: {
    code: 'E904',
    title: '启动预检查失败',
    causes: ['系统环境不满足要求', '必要服务未运行', '配置存在问题'],
    solutions: ['运行诊断命令检查问题', '检查上述错误信息并逐一解决', '确保所有必要服务已启动'],
  },
} as const;

/**
 * Union type of all error codes
 */
export type ErrorCode =
  | (typeof ConfigErrors)[keyof typeof ConfigErrors]
  | (typeof UserErrors)[keyof typeof UserErrors]
  | (typeof QuotaErrors)[keyof typeof QuotaErrors]
  | (typeof ServiceErrors)[keyof typeof ServiceErrors]
  | (typeof NetworkErrors)[keyof typeof NetworkErrors]
  | (typeof FileErrors)[keyof typeof FileErrors]
  | (typeof ValidationErrors)[keyof typeof ValidationErrors]
  | (typeof ProtocolErrors)[keyof typeof ProtocolErrors]
  | (typeof SystemErrors)[keyof typeof SystemErrors];

/**
 * Find error info by error code string
 */
export function findErrorByCode(code: string): ErrorInfo | undefined {
  const allErrors = {
    ...ConfigErrors,
    ...UserErrors,
    ...QuotaErrors,
    ...ServiceErrors,
    ...NetworkErrors,
    ...FileErrors,
    ...ValidationErrors,
    ...ProtocolErrors,
    ...SystemErrors,
  };

  for (const error of Object.values(allErrors)) {
    if (error.code === code) {
      return error;
    }
  }

  return undefined;
}

/**
 * Get all error codes list
 */
export function getAllErrorCodes(): string[] {
  const allErrors = {
    ...ConfigErrors,
    ...UserErrors,
    ...QuotaErrors,
    ...ServiceErrors,
    ...NetworkErrors,
    ...FileErrors,
    ...ValidationErrors,
    ...ProtocolErrors,
    ...SystemErrors,
  };

  return Object.values(allErrors).map((e) => e.code);
}
