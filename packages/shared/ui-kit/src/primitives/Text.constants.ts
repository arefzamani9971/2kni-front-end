import type { ElementType } from 'react';
import type { TextTone, TextVariant } from './Text.types';

export const TONES: Record<TextTone, string> = {
  primary: 'text-fg-primary',
  secondary: 'text-fg-secondary',
  tertiary: 'text-fg-tertiary',
  brand: 'text-fg-brand',
  inverse: 'text-fg-inverse',
  disabled: 'text-fg-disabled',
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
};

export const DEFAULT_TAG: Partial<Record<TextVariant, ElementType>> = {
  'display-l': 'h1',
  'heading-xl': 'h1',
  'heading-l': 'h1',
  'heading-m': 'h2',
  'heading-s': 'h3',
};
