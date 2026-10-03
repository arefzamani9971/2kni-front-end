import { cn } from '../lib/cn';

/**
 * Figma `Dukani/Option Item` (649:581): 48 mobile · 40 desktop (density token), padding spacing/3, radius sm,
 * Body/M. Hover = bg muted, Selected = brand-subtle + ✓ (not color only), keyboard focus = 2px focus border and is
 * independent from selection, Disabled = text disabled and not selectable.
 */
export function optionItemClassName({ selected, disabled }: { selected?: boolean; disabled?: boolean }) {
  return cn(
    'flex min-h-control-adaptive w-full cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-start text-body-m text-fg-primary outline-none',
    'hover:bg-muted focus-visible:shadow-[inset_0_0_0_2px_var(--dukani-color-border-focus)]',
    selected && 'bg-brand-subtle hover:bg-brand-subtle',
    disabled && 'cursor-not-allowed text-fg-disabled hover:bg-transparent',
  );
}
