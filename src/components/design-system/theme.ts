export interface Theme {
  // Brand
  primary: string;
  primaryShimmer: string;

  // Semantic
  success: string;
  error: string;
  warning: string;
  info: string;

  // Text
  text: string;
  inverseText: string;
  inactive: string;
  subtle: string;

  // UI Chrome
  border: string;
  borderAccent: string;
  highlight: string;

  // Service status
  serviceRunning: string;
  serviceStopped: string;

  // Quota
  quotaNormal: string;
  quotaWarning: string;
  quotaExceeded: string;
  quotaUnlimited: string;

  // Progress
  progressFill: string;
  progressEmpty: string;
}

export type ThemeName = 'dark' | 'light';

export const darkTheme: Theme = {
  primary: '#00c8c8',
  primaryShimmer: '#32e6e6',

  success: '#48c757',
  error: '#f04747',
  warning: '#fac83c',
  info: '#5789f7',

  text: '#e6e6e6',
  inverseText: '#141414',
  inactive: '#808080',
  subtle: '#5a5a5a',

  border: '#3c3c3c',
  borderAccent: '#00c8c8',
  highlight: '#283c3c',

  serviceRunning: '#48c757',
  serviceStopped: '#f04747',

  quotaNormal: '#48c757',
  quotaWarning: '#fac83c',
  quotaExceeded: '#f04747',
  quotaUnlimited: '#5789f7',

  progressFill: '#00c8c8',
  progressEmpty: '#323232',
};

export const lightTheme: Theme = {
  primary: '#009999',
  primaryShimmer: '#00b7b7',

  success: '#2c7a39',
  error: '#ab2b3f',
  warning: '#966c1e',
  info: '#5769f7',

  text: '#141414',
  inverseText: '#f5f5f5',
  inactive: '#787878',
  subtle: '#afafaf',

  border: '#c8c8c8',
  borderAccent: '#009999',
  highlight: '#dcf0f0',

  serviceRunning: '#2c7a39',
  serviceStopped: '#ab2b3f',

  quotaNormal: '#2c7a39',
  quotaWarning: '#966c1e',
  quotaExceeded: '#ab2b3f',
  quotaUnlimited: '#5769f7',

  progressFill: '#009999',
  progressEmpty: '#dcdcdc',
};

const themes: Record<ThemeName, Theme> = { dark: darkTheme, light: lightTheme };

export function getTheme(name: ThemeName): Theme {
  return themes[name];
}

export function resolveColor(color: string | undefined, theme: Theme): string | undefined {
  if (!color) return undefined;
  if (color.startsWith('#') || color.startsWith('rgb(') || color.startsWith('ansi')) {
    return color;
  }
  return (theme as unknown as Record<string, string>)[color] ?? color;
}
