'use client';
import { type KeyboardEvent, useRef } from 'react';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import type { OptionListProps } from './OptionList.types';
import { optionItemClassName } from './OptionList.styles';

/**
 * Single-select listbox shared by every viewport strategy (sheet and popover render the same list).
 * Keyboard (Figma interaction rules): ↑/↓ move, Home/End jump, Enter/Space select; Escape is handled by the
 * surrounding panel. Roving tabindex keeps one tab stop, starting at the selected option.
 */
export function OptionList<V extends string>({
  options,
  value,
  onSelect,
  label,
  empty = 'موردی پیدا نشد.',
  className,
}: OptionListProps<V>) {
  const listRef = useRef<HTMLDivElement>(null);
  const enabled = options.filter((o) => !o.disabled);
  const tabStop = enabled.find((o) => o.value === value)?.value ?? enabled[0]?.value;

  const focusAt = (index: number) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>(
      '[role="option"]:not([aria-disabled="true"])',
    );
    if (!items?.length) return;
    items[(index + items.length) % items.length]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? [],
    );
    const current = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowUp: current - 1,
      Home: 0,
      End: items.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      focusAt(moves[e.key]!);
    }
  };

  if (options.length === 0) return <p className="text-body-m text-fg-secondary py-6 text-center">{empty}</p>;

  return (
    <div
      ref={listRef}
      role="listbox"
      tabIndex={-1}
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex flex-col gap-0.5', className)}
    >
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
            <span aria-hidden className="text-fg-brand flex size-5 shrink-0 items-center justify-center">
              {selected ? <Icon name="check" size={20} /> : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
