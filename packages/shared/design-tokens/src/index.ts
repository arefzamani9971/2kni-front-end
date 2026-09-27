/** Token values for JS consumers (charts, map markers). CSS consumers use tokens.css / theme.css. */
export const THEMES = ['shop', 'customer', 'admin'] as const;
export type ThemeMode = (typeof THEMES)[number];

export const cssVar = (name: string) => `var(--dukani-${name})`;

export const FONT_FILES = [
  { file: 'IRANSansX-LightD4.woff2', weight: '300' },
  { file: 'IRANSansX-RegularD4.woff2', weight: '400' },
  { file: 'IRANSansX-MediumD4.woff2', weight: '500' },
  { file: 'IRANSansX-DemiBoldD4.woff2', weight: '600' },
  { file: 'IRANSansX-BoldD4.woff2', weight: '700' },
  { file: 'IRANSansX-ExtraBoldD4.woff2', weight: '800' },
] as const;
