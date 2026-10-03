import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { ChipProps } from './Chip.types';

/**
 * Figma `Production/Chip` (494:34, Selected Yes/No): 44px pill (touch/min), px spacing/3, Label/S, border default.
 * Selected = brand-subtle fill + brand text; also shown with a check, not color only.
 */
export function Chip({ selected = false, className, children, type, ...rest }: ChipProps) {
  return (
    <button
      type={type ?? 'button'}
      aria-pressed={selected}
      className={cn(
        'h-touch border-line text-label-s inline-flex shrink-0 items-center gap-1 rounded-full border px-3 transition-colors',
        selected ? 'bg-brand-subtle text-fg-brand' : 'bg-surface text-fg-primary hover:bg-muted',
        className,
      )}
      {...rest}
    >
      {selected ? <Icon name="check" size={14} /> : null}
      {children}
    </button>
  );
}
