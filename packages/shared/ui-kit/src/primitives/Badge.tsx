import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { BadgeProps } from './Badge.types';
import { badgeSize, OUTLINE, SUBTLE } from './Badge.constants';

/** Status pill: text + optional icon (never color alone). */
export function Badge({
  tone = 'neutral',
  appearance = 'subtle',
  size,
  icon,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(badgeSize({ size }), appearance === 'outline' ? OUTLINE[tone] : SUBTLE[tone], className)}
    >
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  );
}
