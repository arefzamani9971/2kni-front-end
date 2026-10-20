'use client';
import { useRef, useState } from 'react';
import { AutocompleteFullscreen } from './AutocompleteFullscreen';
import { SearchField } from './SearchField';
import type { TableAutocompleteProps } from './TableAutocomplete.types';

/**
 * Mobile Table Autocomplete: a touch on the field opens the full-screen search at once (no keyboard on the page
 * field itself); the query is kept, and the page under it stays mounted.
 */
export function TableAutocompleteMobile<T>(props: TableAutocompleteProps<T>) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLInputElement>(null);
  const show = () => {
    if (!props.disabled) setOpen(true);
  };
  return (
    <>
      <SearchField
        ref={trigger}
        className={props.className}
        label={props.label}
        hideLabel={props.hideLabel}
        placeholder={props.placeholder}
        hint={props.hint}
        disabled={props.disabled}
        readOnly
        value={props.query}
        onChange={props.onQueryChange}
        inputProps={{
          // a combobox whose popup is the full-screen dialog (searchbox does not take aria-expanded)
          role: 'combobox',
          'aria-haspopup': 'dialog',
          'aria-expanded': open,
          onClick: show,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              show();
            }
          },
        }}
      />
      <AutocompleteFullscreen {...props} open={open} onOpenChange={setOpen} returnFocusRef={trigger} />
    </>
  );
}
