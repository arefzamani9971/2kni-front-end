/** Token values for JS consumers (charts, map markers). CSS consumers use tokens.css / theme.css. */
export const THEMES = ['shop', 'customer', 'admin'] as const;

/** Figma `Viewport` variant values. Mobile is the default; desktop switches density and presentation. */
export const VIEWPORTS = ['mobile', 'desktop'] as const;

/** Keep in sync with --dukani-viewport-desktop-min in tokens.css (ui-guidelines §12 «Wide ≥ 1024»). */
export const VIEWPORT_DESKTOP_MIN = 1024;

export const VIEWPORT_DESKTOP_QUERY = `(min-width: ${VIEWPORT_DESKTOP_MIN}px)`;

/** Attribute on <html> that drives the CSS `desktop:` variant and the density tokens. */
export const VIEWPORT_ATTRIBUTE = 'data-viewport';

export const FONT_FILES = [
  { file: 'IRANSansX-LightD4.woff2', weight: '300' },
  { file: 'IRANSansX-RegularD4.woff2', weight: '400' },
  { file: 'IRANSansX-MediumD4.woff2', weight: '500' },
  { file: 'IRANSansX-DemiBoldD4.woff2', weight: '600' },
  { file: 'IRANSansX-BoldD4.woff2', weight: '700' },
  { file: 'IRANSansX-ExtraBoldD4.woff2', weight: '800' },
] as const;
