import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Icon, type IconName } from '../icons/Icon';
import { cn } from '../lib/cn';

export type PillActionProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  icon?: IconName;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
};

/**
 * Figma `Pill Action` (498:56): compact inline action (e.g. «افزودن به سبد») — 38px, radius 10, px 14, Label/M,
 * brand-subtle fill with brand text; Disabled = bg/disabled with secondary text (e.g. «ناموجود»).
 */
export function PillAction({ icon, className, type, children, ref, ...rest }: PillActionProps) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(
        'inline-flex h-9.5 shrink-0 items-center justify-center gap-1 rounded-[10px] bg-brand-subtle px-3.5 text-label-m text-fg-brand transition-colors',
        'hover:bg-brand-subtle/70 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-fg-secondary',
        className,
      )}
      {...rest}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}
