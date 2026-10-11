'use client';
import { useId, useState } from 'react';
import { SearchField } from './SearchField';
import type { TextFieldProps } from './TextField.types';
export type SearchSuggestion = { id: string; label: string; description?: string };
type Props = Omit<TextFieldProps, 'type' | 'prefix' | 'clearable'> & {
  suggestions: readonly SearchSuggestion[];
  onSelect: (id: string) => void;
};
/** Server-backed suggestions, with focus retained in the input and keyboard selection. */
export function SearchAutocomplete({ suggestions, onSelect, ...props }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const visible = open && suggestions.length > 0;
  const choose = (index: number) => {
    const option = suggestions[index];
    if (option) {
      setOpen(false);
      setActive(-1);
      onSelect(option.id);
    }
  };
  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <SearchField
        {...props}
        onFocus={(event) => {
          setOpen(true);
          props.onFocus?.(event);
        }}
        onChange={(value) => {
          setActive(-1);
          setOpen(true);
          props.onChange?.(value);
        }}
        inputProps={{
          ...props.inputProps,
          role: 'combobox',
          'aria-autocomplete': 'list',
          'aria-expanded': visible,
          'aria-controls': id,
          'aria-activedescendant':
            visible && active >= 0 && active < suggestions.length ? id + '-' + active : undefined,
          onKeyDown: (event) => {
            props.inputProps?.onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (event.key === 'Escape') {
              setOpen(false);
              setActive(-1);
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setOpen(true);
              setActive((previous) =>
                suggestions.length
                  ? (previous + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) %
                    suggestions.length
                  : -1,
              );
            } else if (event.key === 'Enter' && visible && active >= 0) {
              event.preventDefault();
              choose(active);
            }
          },
        }}
      />
      {visible ? (
        <ul
          id={id}
          role="listbox"
          aria-label={typeof props.label === 'string' ? props.label : undefined}
          className="border-line bg-surface absolute inset-x-0 top-full z-20 mt-2 flex max-h-72 flex-col overflow-auto rounded-lg border p-2 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={id + '-' + index}
              role="option"
              aria-selected={active === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => setActive(index)}
              onClick={() => choose(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  choose(index);
                }
              }}
              className="hover:bg-muted text-body-m cursor-pointer rounded-md p-3"
            >
              <span>{suggestion.label}</span>
              {suggestion.description ? (
                <span className="text-fg-secondary text-body-s mt-1 block">{suggestion.description}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
