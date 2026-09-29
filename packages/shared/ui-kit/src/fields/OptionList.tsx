'use client';
import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';

export type OptionListItem<V extends string = string> = {
  value: V;
  label: string;
  description?: string;
  disabled?: boolean;
};

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

export type OptionListProps<V extends string> = {
  options: readonly OptionListItem<V>[];
  value?: V | '';
  onSelect: (value: V) => void;
  /** Accessible name of the listbox (the field label). */
  label?: string;
  empty?: ReactNode;
  className?: string;
};

/**
 * Single-select listbox shared by every viewport strategy (sheet and popover render the same list).
 * Keyboard (Figma interaction rules): ↑/↓ move, Home/End jump, Enter/Space select; Escape is handled by the
 * surrounding panel. Roving tabindex keeps one tab stop, starting at the selected option.
 */
export function OptionList<V extends string>({ options, value, onSelect, label, empty = 'موردی پیدا نشد.', className }: OptionListProps<V>) {
  const listRef = useRef<HTMLDivElement>(null);
  const enabled = options.filter((o) => !o.disabled);
  const tabStop = enabled.find((o) => o.value === value)?.value ?? enabled[0]?.value;

  const focusAt = (index: number) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])');
    if (!items?.length) return;
    items[(index + items.length) % items.length]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? []);
    const current = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = { ArrowDown: current + 1, ArrowUp: current - 1, Home: 0, End: items.length - 1 };
    if (e.key in moves) {
      e.preventDefault();
      focusAt(moves[e.key]!);
    }
  };

  if (options.length === 0) return <p className="py-6 text-center text-body-m text-fg-secondary">{empty}</p>;

  return (
    <div ref={listRef} role="listbox" tabIndex={-1} aria-label={label} onKeyDown={onKeyDown} className={cn('flex flex-col gap-0.5', className)}>
      {options.map((o) => {
        const selected = o.value === value;
        const select = () => {
          if (!o.disabled) onSelect(o.value);
        };
        return (
          <div
            key={o.value}
            role="option"
            aria-selected={selected}
            aria-disabled={o.disabled || undefined}
            tabIndex={o.value === tabStop ? 0 : -1}
            onClick={select}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
              }
            }}
            className={optionItemClassName({ selected, disabled: o.disabled })}
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span>{o.label}</span>
              {o.description ? <span className="text-body-s text-fg-secondary">{o.description}</span> : null}
            </span>
            <span aria-hidden className="flex size-5 shrink-0 items-center justify-center text-fg-brand">
              {selected ? <Icon name="check" size={20} /> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
