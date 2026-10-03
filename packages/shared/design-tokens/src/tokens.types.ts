import type { THEMES, VIEWPORTS } from './tokens.constants';

export type ThemeMode = (typeof THEMES)[number];

export type Viewport = (typeof VIEWPORTS)[number];
