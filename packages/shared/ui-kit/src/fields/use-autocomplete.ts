'use client';
import { useId, useState, type KeyboardEvent } from 'react';
import type { AutocompleteController, UseAutocompleteOptions } from './use-autocomplete.types';

/**
 * The one selection controller of `SearchAutocomplete` and `TableAutocomplete`: active option, ArrowUp/Down that
 * skip disabled options, Enter on the active option only (never a guessed choice), Escape closes. Focus stays in
 * the input; the options are referenced through `aria-activedescendant`.
 */
export function useAutocomplete<T>({
  items,
  onSelect,
  isDisabled,
  open,
  setOpen,
  onSubmit,
}: UseAutocompleteOptions<T>): AutocompleteController {
  const listId = useId();
  const [active, setActive] = useState(-1);
  const optionId = (index: number) => listId + '-' + index;
  const choose = (index: number) => {
    const item = items[index];
    if (item === undefined || isDisabled?.(item)) return;
    setOpen(false);
    setActive(-1);
    onSelect(item);
  };
  const move = (step: 1 | -1) =>
    setActive((previous) => {
      for (let i = 1; i <= items.length; i++) {
        const next = (previous + step * i + items.length * 2) % items.length;
        if (!isDisabled?.(items[next]!)) return next;
      }
      return -1;
    });
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setActive(-1);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (items.length) move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      if (open && active >= 0 && active < items.length) {
        event.preventDefault();
        choose(active);
      } else onSubmit?.();
    }
  };
  const activeDescendant = open && active >= 0 && active < items.length ? optionId(active) : undefined;
  return {
    listId,
    optionId,
    active,
    setActive,
    reset: () => setActive(-1),
    choose,
    onKeyDown,
    activeDescendant,
  };
}
