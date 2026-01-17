/**
 * Error Formatter Utility
 * @module utils/error-formatter
 *
 * Formats errors into user-friendly output with causes and solutions.
 */

import chalk from 'chalk';
import { AppError } from './errors';
import { ErrorInfo, findErrorByCode } from '../constants/error-codes';
import { detectTerminalCapabilities } from './terminal';
import { getOutputMode, OutputMode } from './logger';

/**
 * Format options
 */
export interface FormatOptions {
  /** Show causes section */
  showCauses?: boolean;
  /** Show solutions section */
  showSolutions?: boolean;
  /** Show stack trace (for debugging) */
  showStack?: boolean;
  /** Indentation string */
  indent?: string;
}

const DEFAULT_OPTIONS: FormatOptions = {
  showCauses: true,
  showSolutions: true,
  showStack: false,
  indent: '  ',
};

/**
 * Get error icon based on terminal capabilities
 */
function getErrorIcon(): string {
  const capabilities = detectTerminalCapabilities();
  return capabilities.supportsUnicode ? '✗' : '[ERROR]';
}

/**
 * Format an AppError into user-friendly output
 * @param error - The AppError to format
 * @param options - Formatting options
 * @returns Formatted error string
 */
export function formatAppError(error: AppError, options?: FormatOptions): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const mode = getOutputMode();
  const lines: string[] = [];
  const indent = opts.indent || '  ';

  // Header line: ✗ 错误 [E101]: 配置文件不存在
  const icon = getErrorIcon();
  const headerText = `${icon} 错误 [${error.code}]: ${error.title}`;

  if (mode === OutputMode.RICH) {
    lines.push(chalk.red.bold(headerText));
  } else {
    lines.push(headerText);
  }

  // Details if present
  if (error.details) {
    lines.push('');
    if (mode === OutputMode.RICH) {
      lines.push(chalk.gray(`${indent}${error.details}`));
    } else {
      lines.push(`${indent}${error.details}`);
    }
  }

  // Causes section
  if (opts.showCauses && error.causes.length > 0) {
    lines.push('');
    if (mode === OutputMode.RICH) {
      lines.push(chalk.yellow('可能的原因:'));
    } else {
      lines.push('可能的原因:');
    }
    error.causes.forEach((cause, index) => {
      const bullet = `${indent}${index + 1}. ${cause}`;
      if (mode === OutputMode.RICH) {
        lines.push(chalk.gray(bullet));
      } else {
        lines.push(bullet);
      }
    });
  }

  // Solutions section
  if (opts.showSolutions && error.solutions.length > 0) {
    lines.push('');
    if (mode === OutputMode.RICH) {
      lines.push(chalk.green('解决方案:'));
    } else {
      lines.push('解决方案:');
    }
    error.solutions.forEach((solution) => {
      const bullet = `${indent}- ${solution}`;
      if (mode === OutputMode.RICH) {
        lines.push(chalk.cyan(bullet));
      } else {
        lines.push(bullet);
      }
    });
  }

  // Stack trace (for debugging)
  if (opts.showStack && error.stack) {
    lines.push('');
    if (mode === OutputMode.RICH) {
      lines.push(chalk.gray('Stack trace:'));
      lines.push(chalk.gray(error.stack));
    } else {
      lines.push('Stack trace:');
      lines.push(error.stack);
    }
  }

  return lines.join('\n');
}

/**
 * Format an ErrorInfo object (without creating an AppError)
 * @param errorInfo - The error info to format
 * @param details - Additional details
 * @param options - Formatting options
 * @returns Formatted error string
 */
export function formatErrorInfo(
  errorInfo: ErrorInfo,
  details?: string,
  options?: FormatOptions,
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const mode = getOutputMode();
  const lines: string[] = [];
  const indent = opts.indent || '  ';

  // Header line
  const icon = getErrorIcon();
  const headerText = `${icon} 错误 [${errorInfo.code}]: ${errorInfo.title}`;

  if (mode === OutputMode.RICH) {
    lines.push(chalk.red.bold(headerText));
  } else {
    lines.push(headerText);
  }

  // Details if present
  if (details) {
    lines.push('');
    if (mode === OutputMode.RICH) {
      lines.push(chalk.gray(`${indent}${details}`));
    } else {
      lines.push(`${indent}${details}`);
    }
  }

  // Causes section
  if (opts.showCauses && errorInfo.causes.length > 0) {
    lines.push('');
    if (mode === OutputMode.RICH) {
      lines.push(chalk.yellow('可能的原因:'));
    } else {
      lines.push('可能的原因:');
    }
    errorInfo.causes.forEach((cause, index) => {
      const bullet = `${indent}${index + 1}. ${cause}`;
      if (mode === OutputMode.RICH) {
        lines.push(chalk.gray(bullet));
      } else {
        lines.push(bullet);
      }
    });
  }

  // Solutions section
  if (opts.showSolutions && errorInfo.solutions.length > 0) {
    lines.push('');
    if (mode === OutputMode.RICH) {
      lines.push(chalk.green('解决方案:'));
    } else {
      lines.push('解决方案:');
    }
    errorInfo.solutions.forEach((solution) => {
      const bullet = `${indent}- ${solution}`;
      if (mode === OutputMode.RICH) {
        lines.push(chalk.cyan(bullet));
      } else {
        lines.push(bullet);
      }
    });
  }

  return lines.join('\n');
}

/**
 * Format a generic Error with fallback error info
 * @param error - The error to format
 * @param fallbackInfo - Fallback error info if not an AppError
 * @param options - Formatting options
 * @returns Formatted error string
 */
export function formatError(
  error: Error,
  fallbackInfo?: ErrorInfo,
  options?: FormatOptions,
): string {
  // If it's an AppError, format it directly
  if (AppError.isAppError(error)) {
    return formatAppError(error, options);
  }

  // If we have fallback info, use it
  if (fallbackInfo) {
    return formatErrorInfo(fallbackInfo, error.message, options);
  }

  // Simple fallback for generic errors
  const mode = getOutputMode();
  const icon = getErrorIcon();
  const headerText = `${icon} 错误: ${error.message}`;

  if (mode === OutputMode.RICH) {
    return chalk.red(headerText);
  }
  return headerText;
}

/**
 * Format error by looking up error code
 * @param code - Error code (e.g., "E101")
 * @param details - Additional details
 * @param options - Formatting options
 * @returns Formatted error string or undefined if code not found
 */
export function formatByCode(
  code: string,
  details?: string,
  options?: FormatOptions,
): string | undefined {
  const errorInfo = findErrorByCode(code);
  if (!errorInfo) {
    return undefined;
  }
  return formatErrorInfo(errorInfo, details, options);
}

/**
 * Create a simple error message (just the header line)
 * @param errorInfo - The error info
 * @param details - Additional details
 * @returns Simple error message
 */
export function simpleErrorMessage(errorInfo: ErrorInfo, details?: string): string {
  const icon = getErrorIcon();
  const message = details
    ? `${icon} 错误 [${errorInfo.code}]: ${errorInfo.title} - ${details}`
    : `${icon} 错误 [${errorInfo.code}]: ${errorInfo.title}`;

  const mode = getOutputMode();
  if (mode === OutputMode.RICH) {
    return chalk.red(message);
  }
  return message;
}
