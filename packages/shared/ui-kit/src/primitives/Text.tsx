import type { ElementType } from 'react';
import { cn } from '../lib/cn';
import type { TextProps } from './Text.types';
import { DEFAULT_TAG, TONES } from './Text.constants';

export function Text<T extends ElementType = 'p'>({
  as,
  variant = 'body-m',
  tone = 'primary',
  className,
  children,
  ...rest
}: TextProps<T>) {
  const Tag = (as ?? DEFAULT_TAG[variant] ?? 'p') as ElementType;
  return (
    <Tag
      className={cn(`text-${variant}`, TONES[tone], variant.startsWith('numeric') && 'tabular', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
