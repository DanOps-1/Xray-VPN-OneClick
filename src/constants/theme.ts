/**
 * UI Theme Configuration
 *
 * Defines the color palette and visual constants for the CLI.
 *
 * @module constants/theme
 */

import chalk from 'chalk';

/**
 * Semantic Color Theme
 */
export const THEME = {
  // Primary: Branding, interactive elements, headers
  primary: chalk.cyan,
  
  // Secondary: Subtitles, less critical info
  secondary: chalk.blue,
  
  // Success: Positive status, success messages
  success: chalk.green,
  
  // Warning: Warning messages, caution states
  warning: chalk.yellow,
  
  // Error: Error messages, failure states
  error: chalk.red,
  
  // Neutral: Static labels, borders, normal text
  neutral: chalk.gray,
  
  // Highlight: Selected items, focused elements
  highlight: chalk.bold.cyan,
  
  // Text: Standard text
  text: chalk.white,
};

/**
 * UI Visual Constants
 */
export const UI_CONSTANTS = {
  // Border style for cli-table3
  // 'single' provides a cleaner look than default double/heavy
  BORDER_STYLE: 'single',
  
  // Status Indicators
  INDICATOR: {
    ACTIVE: '●',
    INACTIVE: '○',
    PENDING: '◌',
  },
  
  // Spacing
  PADDING: 1,
};
