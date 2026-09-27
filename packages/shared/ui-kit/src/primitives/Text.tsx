import type { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../lib/cn';

/** Figma text styles (Dukani/Heading/L …). */
export type TextVariant =
  | 'display-l'
  | 'heading-xl'
  | 'heading-l'
  | 'heading-m'
  | 'heading-s'
  | 'body-l'
  | 'body-m'
  | 'body-s'
  | 'label-l'
  | 'label-m'
  | 'label-s'
  | 'caption'
  | 'numeric-l'
  | 'numeric-m';

export type TextTone = 'primary' | 'secondary' | 'brand' | 'inverse' | 'disabled' | 'danger' | 'warning' | 'success' | 'info';

const TONES: Record<TextTone, string> = {
  primary: 'text-fg-primary',
  secondary: 'text-fg-secondary',
  brand: 'text-fg-brand',
  inverse: 'text-fg-inverse',
  disabled: 'text-fg-disabled',
  danger: 'text-danger',
  warning: 'text-warning',
  success: 'text-success',
  info: 'text-info',
};

const DEFAULT_TAG: Partial<Record<TextVariant, ElementType>> = {
  'display-l': 'h1',
  'heading-xl': 'h1',
  'heading-l': 'h1',
  'heading-m': 'h2',
  'heading-s': 'h3',
};

export type TextProps<T extends ElementType = 'p'> = {
  as?: T;
  variant?: TextVariant;
  tone?: TextTone;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function Text<T extends ElementType = 'p'>({ as, variant = 'body-m', tone = 'primary', className, children, ...rest }: TextProps<T>) {
  const Tag = (as ?? DEFAULT_TAG[variant] ?? 'p') as ElementType;
  return (
    <Tag className={cn(`text-${variant}`, TONES[tone], variant.startsWith('numeric') && 'tabular', className)} {...rest}>
      {children}
    </Tag>
  );
}
