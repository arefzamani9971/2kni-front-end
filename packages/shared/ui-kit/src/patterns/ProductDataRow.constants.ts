import type { Tone } from '../lib/types';

export const META_TONE: Record<Tone, string> = {
  neutral: 'text-fg-secondary',
  brand: 'text-fg-brand',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
};
