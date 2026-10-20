'use client';
import { useState } from 'react';
import { SearchField } from './SearchField';
import type { SearchAutocompleteProps, SearchSuggestion } from './SearchAutocomplete.types';
import { useAutocomplete } from './use-autocomplete';
/** Server-backed suggestions, with focus retained in the input and keyboard selection (shared controller). */
export function SearchAutocomplete({ suggestions, onSelect, notice, ...props }: SearchAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const control = useAutocomplete<SearchSuggestion>({
    items: suggestions,
    onSelect: (suggestion) => onSelect(suggestion.id),
    open,
    setOpen,
  });
  const visible = open && suggestions.length > 0;
  const noticeVisible = open && !visible && notice != null;
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
          control.reset();
          setOpen(true);
          props.onChange?.(value);
        }}
        inputProps={{
          ...props.inputProps,
          role: 'combobox',
          'aria-autocomplete': 'list',
          'aria-expanded': visible,
          'aria-controls': control.listId,
          'aria-activedescendant': visible ? control.activeDescendant : undefined,
          onKeyDown: (event) => {
            props.inputProps?.onKeyDown?.(event);
            control.onKeyDown(event);
          },
        }}
      />
      {visible ? (
        <ul
          id={control.listId}
          role="listbox"
          aria-label={typeof props.label === 'string' ? props.label : undefined}
          className="border-line bg-surface absolute inset-x-0 top-full z-20 mt-2 flex max-h-72 flex-col overflow-auto rounded-lg border p-2 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={control.optionId(index)}
              role="option"
              aria-selected={control.active === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => control.setActive(index)}
              onClick={() => control.choose(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  control.choose(index);
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
      {noticeVisible ? (
        <div
          role="status"
          className="border-line bg-surface text-body-m text-fg-secondary absolute inset-x-0 top-full z-20 mt-2 rounded-lg border p-4 shadow-lg"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
}
