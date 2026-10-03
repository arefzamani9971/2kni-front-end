import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

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

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'brand'
  | 'inverse'
  | 'disabled'
  | 'danger'
  | 'warning'
  | 'success'
  | 'info';

export type TextProps<T extends ElementType = 'p'> = {
  as?: T;
  variant?: TextVariant;
  tone?: TextTone;
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;
