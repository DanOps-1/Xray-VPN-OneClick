/**
 * Which utility - Find executable in PATH
 *
 * @module utils/which
 */

import { execSync } from 'child_process';

/**
 * Find executable in PATH
 *
 * @param command - Command name to find
 * @returns Path to executable or null if not found
 */
export function which(command: string): string | null {
  try {
    const result = execSync(`which ${command}`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return result.trim() || null;
  } catch {
    return null;
  }
}
