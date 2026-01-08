/**
 * 输入验证工具函数
 * @module utils/validator
 */

/**
 * 邮箱验证正则表达式
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * UUID v4 验证正则表达式
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * 端口号验证正则表达式（1-65535）
 */
const _PORT_REGEX = /^([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])$/;

/**
 * 域名验证正则表达式
 */
const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

/**
 * 服务名验证正则表达式（仅字母数字、@、._-）
 */
const SERVICE_NAME_REGEX = /^[a-zA-Z0-9@._-]+$/;

/**
 * IPv4 地址验证正则表达式
 */
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * 路径验证正则表达式（Unix 路径）
 */
const PATH_REGEX = /^\/(?:[^/\0]+\/)*[^/\0]*$/;

/**
 * 验证邮箱地址
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email);
}

/**
 * 验证 UUID v4 格式
 * @param uuid UUID 字符串
 * @returns 是否有效
 */
export function isValidUuid(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  return UUID_V4_REGEX.test(uuid);
}

/**
 * 验证端口号（1-65535）
 * @param port 端口号（数字或字符串）
 * @returns 是否有效
 */
export function isValidPort(port: number | string): boolean {
  const num = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(num) || !Number.isInteger(num)) {
    return false;
  }

  return num >= 1 && num <= 65535;
}

/**
 * 验证域名
 * @param domain 域名
 * @returns 是否有效
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }
  return DOMAIN_REGEX.test(domain);
}

/**
 * 验证服务名称
 * @param serviceName 服务名称
 * @returns 是否有效
 */
export function isValidServiceName(serviceName: string): boolean {
  if (!serviceName || typeof serviceName !== 'string') {
    return false;
  }
  return SERVICE_NAME_REGEX.test(serviceName);
}

/**
 * 验证 IPv4 地址
 * @param ip IP 地址
 * @returns 是否有效
 */
export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') {
    return false;
  }
  return IPV4_REGEX.test(ip);
}

/**
 * 验证 Unix 路径
 * @param path 路径字符串
 * @returns 是否有效
 */
export function isValidPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }
  return PATH_REGEX.test(path);
}

/**
 * 验证 URL
 * @param url URL 字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证器接口
 */
export interface Validator {
  validate(_value: string): boolean;
  errorMessage: string;
}

/**
 * 验证器映射
 */
export const validators: Record<string, Validator> = {
  email: {
    validate: isValidEmail,
    errorMessage: '请输入有效的邮箱地址（如 user@example.com）',
  },

  uuid: {
    validate: isValidUuid,
    errorMessage: '请输入有效的 UUID v4 格式',
  },

  port: {
    validate: (value) => {
      const num = parseInt(value, 10);
      return !isNaN(num) && isValidPort(num);
    },
    errorMessage: '端口号必须在 1-65535 之间',
  },

  domain: {
    validate: isValidDomain,
    errorMessage: '请输入有效的域名（如 example.com）',
  },

  serviceName: {
    validate: isValidServiceName,
    errorMessage: '服务名只能包含字母、数字和 @._- 字符',
  },

  ipv4: {
    validate: isValidIPv4,
    errorMessage: '请输入有效的 IPv4 地址',
  },

  path: {
    validate: isValidPath,
    errorMessage: '请输入有效的 Unix 路径（以 / 开头）',
  },

  url: {
    validate: isValidUrl,
    errorMessage: '请输入有效的 URL',
  },
};

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean;

  /** 错误消息 */
  error?: string;

  /** 字段名称 */
  field?: string;
}

/**
 * 通用验证函数
 * @param value 待验证的值
 * @param validatorName 验证器名称
 * @param fieldName 字段名称（用于错误消息）
 * @returns 验证结果
 */
export function validate(
  value: string,
  validatorName: keyof typeof validators,
  fieldName?: string
): ValidationResult {
  const validator = validators[validatorName];

  if (!validator) {
    return {
      valid: false,
      error: `未知的验证器: ${validatorName}`,
      field: fieldName,
    };
  }

  const valid = validator.validate(value);

  if (!valid) {
    return {
      valid: false,
      error: validator.errorMessage,
      field: fieldName,
    };
  }

  return { valid: true };
}

/**
 * 批量验证
 * @param values 字段和值的映射
 * @param validatorMap 字段和验证器的映射
 * @returns 验证结果列表
 */
export function validateMultiple(
  values: Record<string, string>,
  validatorMap: Record<string, keyof typeof validators>
): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const [field, value] of Object.entries(values)) {
    const validatorName = validatorMap[field];
    if (validatorName) {
      results.push(validate(value, validatorName, field));
    }
  }

  return results;
}

/**
 * 检查所有验证是否通过
 * @param results 验证结果列表
 * @returns 是否全部通过
 */
export function allValid(results: ValidationResult[]): boolean {
  return results.every((result) => result.valid);
}

/**
 * 获取所有错误消息
 * @param results 验证结果列表
 * @returns 错误消息列表
 */
export function getErrors(results: ValidationResult[]): string[] {
  return results.filter((result) => !result.valid).map((result) => result.error || '未知错误');
}
