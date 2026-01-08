/**
 * Clipboard Utility
 *
 * Copy text to system clipboard
 *
 * @module utils/clipboard
 */

import clipboardy from 'clipboardy';

/**
 * Copy text to clipboard
 *
 * @param text - Text to copy
 * @returns True if successful
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await clipboardy.write(text);
    return true;
  } catch {
    // Clipboard may not be available in non-interactive environments
    return false;
  }
}

/**
 * Read text from clipboard
 *
 * @returns Text from clipboard
 */
export async function readFromClipboard(): Promise<string> {
  try {
    return await clipboardy.read();
  } catch {
    return '';
  }
}
