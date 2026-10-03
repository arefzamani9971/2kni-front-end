// Icon facade over lucide-react (the Figma icons are Lucide icons). Features use names, never the library.

import { cn } from '../lib/cn';
import type { IconProps } from './Icon.types';
import { ICONS } from './Icon.constants';
import { DIRECTIONAL } from './Icon.constants';

export function Icon({ name, size = 20, className, strokeWidth = 1.75, label }: IconProps) {
  const Cmp = ICONS[name];
  return (
    <Cmp
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', DIRECTIONAL.has(name) && 'ltr:-scale-x-100', className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable={false}
    />
  );
}
