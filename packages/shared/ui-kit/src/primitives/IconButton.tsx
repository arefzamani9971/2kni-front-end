import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { IconButtonProps } from './IconButton.types';

/** 44×44 touch target on mobile (touch/min); 40×40 on desktop (Figma control/desktop). */
export function IconButton({
  icon,
  label,
  size = 24,
  tone = 'default',
  className,
  type,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cn(
        'desktop:size-10 hover:bg-muted inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-38',
        tone === 'default' && 'text-icon',
        tone === 'brand' && 'text-fg-brand',
        tone === 'danger' && 'text-danger',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
