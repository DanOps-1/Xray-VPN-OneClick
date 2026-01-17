/**
 * Custom Error Classes for CLI
 * @module utils/errors
 *
 * Provides structured error handling with error codes,
 * causes, and solutions for user-friendly error messages.
 */

import { ErrorInfo } from '../constants/error-codes';

/**
 * Base application error with structured error information
 */
export class AppError extends Error {
  /** Error code (e.g., E101) */
  public readonly code: string;

  /** Error title */
  public readonly title: string;

  /** Possible causes */
  public readonly causes: readonly string[];

  /** Suggested solutions */
  public readonly solutions: readonly string[];

  /** Additional context/details */
  public readonly details?: string;

  /**
   * Create an AppError from ErrorInfo
   * @param errorInfo - Error definition from error-codes.ts
   * @param details - Additional context (e.g., file path, specific value)
   */
  constructor(errorInfo: ErrorInfo, details?: string) {
    // Build the message from title and details
    const message = details ? `${errorInfo.title}: ${details}` : errorInfo.title;
    super(message);

    this.name = 'AppError';
    this.code = errorInfo.code;
    this.title = errorInfo.title;
    this.causes = errorInfo.causes;
    this.solutions = errorInfo.solutions;
    this.details = details;

    // Maintains proper stack trace for where error was thrown (V8 engines)
    const ErrorWithCaptureStackTrace = Error as typeof Error & {
      captureStackTrace?: (_target: object, _constructor: Function) => void;
    };
    if (ErrorWithCaptureStackTrace.captureStackTrace) {
      ErrorWithCaptureStackTrace.captureStackTrace(this, AppError);
    }
  }

  /**
   * Check if an error is an AppError
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  /**
   * Convert a generic Error to AppError with a fallback error info
   */
  static fromError(error: Error, fallbackInfo: ErrorInfo): AppError {
    if (AppError.isAppError(error)) {
      return error;
    }
    return new AppError(fallbackInfo, error.message);
  }
}

/**
 * Configuration-related error
 */
export class ConfigError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'ConfigError';
  }
}

/**
 * User management error
 */
export class UserError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'UserError';
  }
}

/**
 * Quota management error
 */
export class QuotaError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'QuotaError';
  }
}

/**
 * Service management error
 */
export class ServiceError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'ServiceError';
  }
}

/**
 * Network-related error
 */
export class NetworkError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'NetworkError';
  }
}

/**
 * File operation error
 */
export class FileError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'FileError';
  }
}

/**
 * Input validation error
 */
export class ValidationError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'ValidationError';
  }
}

/**
 * Protocol parsing error (VLESS, etc.)
 */
export class ProtocolError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'ProtocolError';
  }
}

/**
 * System/permission error
 */
export class SystemError extends AppError {
  constructor(errorInfo: ErrorInfo, details?: string) {
    super(errorInfo, details);
    this.name = 'SystemError';
  }
}
