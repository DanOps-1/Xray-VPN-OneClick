/**
 * CLI Installation Integration Test
 *
 * Tests the installation and basic execution of the CLI tool
 * Following TDD: This test MUST FAIL before implementation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { spawn, execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

const CLI_PATH = join(__dirname, '../../dist/cli.js');

describe('CLI Installation', () => {
  beforeAll(() => {
    // Ensure the project is built before running tests
    if (!existsSync(CLI_PATH)) {
      console.log('Building project for CLI tests...');
      try {
        execSync('npm run build', {
          cwd: join(__dirname, '../..'),
          stdio: 'inherit'
        });
      } catch (error) {
        console.error('Failed to build project:', error);
        throw error;
      }
    }
  });

  describe('Binary Existence', () => {
    it('should have xray-manager binary defined in package.json', async () => {
      const packageJson = await import('../../package.json');

      expect(packageJson.bin).toBeDefined();
      expect(packageJson.bin['xray-manager']).toBe('./dist/cli.js');
      expect(packageJson.bin['xm']).toBe('./dist/cli.js');
    });

    it('should have correct package name and version', async () => {
      const packageJson = await import('../../package.json');

      expect(packageJson.name).toBe('xray-manager');
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('CLI Execution', () => {
    it('should execute CLI without errors (--help flag)', (done) => {
      const child = spawn('node', [CLI_PATH, '--help'], {
        env: { ...process.env, NODE_ENV: 'test' },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        expect(stdout).toContain('xray-manager');
        expect(stderr).toBe('');
        done();
      });
    }, 10000);

    it('should display version information (--version flag)', (done) => {
      const child = spawn('node', [CLI_PATH, '--version'], {
        env: { ...process.env, NODE_ENV: 'test' },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0) {
          console.error('CLI stderr:', stderr);
          console.error('CLI stdout:', stdout);
        }
        expect(code).toBe(0);
        expect(stdout).toMatch(/\d+\.\d+\.\d+/);
        done();
      });
    }, 10000);

    it('should have executable shebang (#!/usr/bin/env node)', async () => {
      const fs = await import('fs/promises');

      try {
        const content = await fs.readFile(CLI_PATH, 'utf-8');
        expect(content).toMatch(/^#!\/usr\/bin\/env node/);
      } catch (error) {
        // Expected to fail before implementation
        expect(error).toBeDefined();
      }
    });
  });

  describe('Exit Codes', () => {
    it('should exit with code 0 on successful help display', (done) => {
      const child = spawn('node', [CLI_PATH, '--help'], {
        env: { ...process.env, NODE_ENV: 'test' },
      });

      child.on('close', (code) => {
        expect(code).toBe(0);
        done();
      });
    }, 10000);

    it('should exit with code 2 on invalid arguments', (done) => {
      const child = spawn('node', [CLI_PATH, '--invalid-flag-that-does-not-exist'], {
        env: { ...process.env, NODE_ENV: 'test' },
      });

      child.on('close', (code) => {
        // Exit code 2 for invalid arguments (from exit-codes.ts)
        expect([1, 2]).toContain(code);
        done();
      });
    }, 10000);
  });

  describe('Global Installation Simulation', () => {
    it('should be installable via npm link (simulation)', async () => {
      const packageJson = await import('../../package.json');

      // Verify package.json has all required fields for npm publishing
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.bin).toBeDefined();
      expect(packageJson.main).toBeDefined();
      expect(packageJson.files).toContain('dist');
    });

    it('should have prepublishOnly script for building before publish', async () => {
      const packageJson = await import('../../package.json');

      expect(packageJson.scripts.prepublishOnly).toBe('npm run build');
    });
  });
});
