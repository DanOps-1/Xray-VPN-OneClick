/**
 * Tests for Validator Utilities
 * @module tests/unit/utils/validator
 */

import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidUuid,
  isValidPort,
  isValidDomain,
  isValidServiceName,
  isValidIPv4,
  isValidPath,
  isValidUrl,
  validate,
  validateMultiple,
  allValid,
  getErrors,
  validators,
} from '../../../src/utils/validator';

describe('Validator Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
      expect(isValidEmail('user_name@example-domain.com')).toBe(true);
      expect(isValidEmail('123@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@example')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isValidEmail(null as any)).toBe(false);
      expect(isValidEmail(undefined as any)).toBe(false);
      expect(isValidEmail(123 as any)).toBe(false);
    });
  });

  describe('isValidUuid', () => {
    it('should validate correct UUID v4 format', () => {
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(isValidUuid('f47ac10b-58cc-4372-a567-0e02b2c3d479')).toBe(true);
      expect(isValidUuid('123e4567-e89b-42d3-a456-426614174000')).toBe(true);
    });

    it('should reject invalid UUID formats', () => {
      expect(isValidUuid('not-a-uuid')).toBe(false);
      expect(isValidUuid('550e8400-e29b-41d4-a716')).toBe(false);
      expect(isValidUuid('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
      expect(isValidUuid('')).toBe(false);
      expect(isValidUuid('550e8400e29b41d4a716446655440000')).toBe(false); // No hyphens
    });

    it('should handle non-string inputs', () => {
      expect(isValidUuid(null as any)).toBe(false);
      expect(isValidUuid(undefined as any)).toBe(false);
    });
  });

  describe('isValidPort', () => {
    it('should validate correct port numbers', () => {
      expect(isValidPort(1)).toBe(true);
      expect(isValidPort(80)).toBe(true);
      expect(isValidPort(443)).toBe(true);
      expect(isValidPort(8080)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
      expect(isValidPort('1')).toBe(true);
      expect(isValidPort('443')).toBe(true);
      expect(isValidPort('65535')).toBe(true);
    });

    it('should reject invalid port numbers', () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(-1)).toBe(false);
      expect(isValidPort(65536)).toBe(false);
      expect(isValidPort(100000)).toBe(false);
      expect(isValidPort(1.5)).toBe(false);
      expect(isValidPort('0')).toBe(false);
      expect(isValidPort('65536')).toBe(false);
      expect(isValidPort('abc')).toBe(false);
      expect(isValidPort('')).toBe(false);
    });

    it('should handle non-numeric inputs', () => {
      expect(isValidPort(NaN)).toBe(false);
      expect(isValidPort(Infinity)).toBe(false);
      expect(isValidPort(null as any)).toBe(false);
      expect(isValidPort(undefined as any)).toBe(false);
    });
  });

  describe('isValidDomain', () => {
    it('should validate correct domain names', () => {
      expect(isValidDomain('example.com')).toBe(true);
      expect(isValidDomain('sub.example.com')).toBe(true);
      expect(isValidDomain('sub-domain.example.com')).toBe(true);
      expect(isValidDomain('example.co.uk')).toBe(true);
      expect(isValidDomain('a.b.c.example.com')).toBe(true);
    });

    it('should reject invalid domain names', () => {
      expect(isValidDomain('example')).toBe(false);
      expect(isValidDomain('.example.com')).toBe(false);
      expect(isValidDomain('example.com.')).toBe(false);
      expect(isValidDomain('example..com')).toBe(false);
      expect(isValidDomain('-example.com')).toBe(false);
      expect(isValidDomain('example-.com')).toBe(false);
      expect(isValidDomain('')).toBe(false);
      expect(isValidDomain('example .com')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isValidDomain(null as any)).toBe(false);
      expect(isValidDomain(undefined as any)).toBe(false);
    });
  });

  describe('isValidServiceName', () => {
    it('should validate correct service names', () => {
      expect(isValidServiceName('xray')).toBe(true);
      expect(isValidServiceName('xray-service')).toBe(true);
      expect(isValidServiceName('xray_service')).toBe(true);
      expect(isValidServiceName('xray.service')).toBe(true);
      expect(isValidServiceName('xray@service')).toBe(true);
      expect(isValidServiceName('123-service')).toBe(true);
    });

    it('should reject invalid service names', () => {
      expect(isValidServiceName('xray service')).toBe(false);
      expect(isValidServiceName('xray/service')).toBe(false);
      expect(isValidServiceName('xray\\service')).toBe(false);
      expect(isValidServiceName('')).toBe(false);
      expect(isValidServiceName('xray!service')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isValidServiceName(null as any)).toBe(false);
      expect(isValidServiceName(undefined as any)).toBe(false);
    });
  });

  describe('isValidIPv4', () => {
    it('should validate correct IPv4 addresses', () => {
      expect(isValidIPv4('192.168.1.1')).toBe(true);
      expect(isValidIPv4('10.0.0.1')).toBe(true);
      expect(isValidIPv4('172.16.0.1')).toBe(true);
      expect(isValidIPv4('8.8.8.8')).toBe(true);
      expect(isValidIPv4('255.255.255.255')).toBe(true);
      expect(isValidIPv4('0.0.0.0')).toBe(true);
    });

    it('should reject invalid IPv4 addresses', () => {
      expect(isValidIPv4('256.1.1.1')).toBe(false);
      expect(isValidIPv4('192.168.1')).toBe(false);
      expect(isValidIPv4('192.168.1.1.1')).toBe(false);
      expect(isValidIPv4('192.168.-1.1')).toBe(false);
      expect(isValidIPv4('192.168.1.a')).toBe(false);
      expect(isValidIPv4('')).toBe(false);
      expect(isValidIPv4('not-an-ip')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isValidIPv4(null as any)).toBe(false);
      expect(isValidIPv4(undefined as any)).toBe(false);
    });
  });

  describe('isValidPath', () => {
    it('should validate correct Unix paths', () => {
      expect(isValidPath('/usr/local/bin')).toBe(true);
      expect(isValidPath('/home/user/file.txt')).toBe(true);
      expect(isValidPath('/etc/xray/config.json')).toBe(true);
      expect(isValidPath('/')).toBe(true);
      expect(isValidPath('/path/with-dash/and_underscore')).toBe(true);
    });

    it('should reject invalid Unix paths', () => {
      expect(isValidPath('relative/path')).toBe(false);
      expect(isValidPath('no-leading-slash')).toBe(false);
      expect(isValidPath('')).toBe(false);
      expect(isValidPath('C:\\Windows\\Path')).toBe(false);
    });

    it('should handle non-string inputs', () => {
      expect(isValidPath(null as any)).toBe(false);
      expect(isValidPath(undefined as any)).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
      expect(isValidUrl('ftp://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
      expect(isValidUrl('://example.com')).toBe(false);
    });
  });

  describe('validators object', () => {
    it('should have all validator functions', () => {
      expect(validators.email).toBeDefined();
      expect(validators.uuid).toBeDefined();
      expect(validators.port).toBeDefined();
      expect(validators.domain).toBeDefined();
      expect(validators.serviceName).toBeDefined();
      expect(validators.ipv4).toBeDefined();
      expect(validators.path).toBeDefined();
      expect(validators.url).toBeDefined();
    });

    it('should have error messages for all validators', () => {
      expect(validators.email.errorMessage).toBeTruthy();
      expect(validators.uuid.errorMessage).toBeTruthy();
      expect(validators.port.errorMessage).toBeTruthy();
      expect(validators.domain.errorMessage).toBeTruthy();
      expect(validators.serviceName.errorMessage).toBeTruthy();
      expect(validators.ipv4.errorMessage).toBeTruthy();
      expect(validators.path.errorMessage).toBeTruthy();
      expect(validators.url.errorMessage).toBeTruthy();
    });
  });

  describe('validate', () => {
    it('should validate with correct validator', () => {
      const result = validate('user@example.com', 'email', 'emailField');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid value', () => {
      const result = validate('invalid-email', 'email', 'emailField');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
      expect(result.field).toBe('emailField');
    });

    it('should handle unknown validator', () => {
      const result = validate('value', 'unknownValidator' as any, 'field');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('未知的验证器');
    });

    it('should work without field name', () => {
      const result = validate('user@example.com', 'email');
      expect(result.valid).toBe(true);
    });
  });

  describe('validateMultiple', () => {
    it('should validate multiple fields', () => {
      const values = {
        email: 'user@example.com',
        port: '443',
        domain: 'example.com',
      };

      const validatorMap = {
        email: 'email' as const,
        port: 'port' as const,
        domain: 'domain' as const,
      };

      const results = validateMultiple(values, validatorMap);

      expect(results).toHaveLength(3);
      expect(results.every((r) => r.valid)).toBe(true);
    });

    it('should return errors for invalid fields', () => {
      const values = {
        email: 'invalid-email',
        port: '99999',
        domain: 'invalid',
      };

      const validatorMap = {
        email: 'email' as const,
        port: 'port' as const,
        domain: 'domain' as const,
      };

      const results = validateMultiple(values, validatorMap);

      expect(results).toHaveLength(3);
      expect(results.every((r) => !r.valid)).toBe(true);
    });

    it('should skip fields without validators', () => {
      const values = {
        email: 'user@example.com',
        other: 'value',
      };

      const validatorMap = {
        email: 'email' as const,
      };

      const results = validateMultiple(values, validatorMap);

      expect(results).toHaveLength(1);
      expect(results[0].valid).toBe(true);
    });
  });

  describe('allValid', () => {
    it('should return true when all results are valid', () => {
      const results = [{ valid: true }, { valid: true }, { valid: true }];

      expect(allValid(results)).toBe(true);
    });

    it('should return false when any result is invalid', () => {
      const results = [{ valid: true }, { valid: false, error: 'Error' }, { valid: true }];

      expect(allValid(results)).toBe(false);
    });

    it('should handle empty array', () => {
      expect(allValid([])).toBe(true);
    });
  });

  describe('getErrors', () => {
    it('should return all error messages', () => {
      const results = [
        { valid: true },
        { valid: false, error: 'Error 1' },
        { valid: false, error: 'Error 2' },
        { valid: true },
      ];

      const errors = getErrors(results);

      expect(errors).toHaveLength(2);
      expect(errors).toContain('Error 1');
      expect(errors).toContain('Error 2');
    });

    it('should handle results without error messages', () => {
      const results = [{ valid: false }, { valid: false, error: undefined }];

      const errors = getErrors(results);

      expect(errors).toHaveLength(2);
      expect(errors.every((e) => e === '未知错误')).toBe(true);
    });

    it('should return empty array when all valid', () => {
      const results = [{ valid: true }, { valid: true }];

      const errors = getErrors(results);

      expect(errors).toHaveLength(0);
    });
  });
});
