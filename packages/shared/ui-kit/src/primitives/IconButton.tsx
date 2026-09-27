import type { ButtonHTMLAttributes, Ref } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon: IconName;
  /** Required accessible name (icon-only buttons, ui-guidelines §15). */
  label: string;
  size?: number;
  tone?: 'default' | 'brand' | 'danger';
  ref?: Ref<HTMLButtonElement>;
};

/** 44×44 touch target (touch/min). */
export function IconButton({ icon, label, size = 24, tone = 'default', className, type, ref, ...rest }: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted disabled:opacity-38',
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
