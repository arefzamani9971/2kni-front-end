'use client';
import { getDirection, useLocale } from '@dukani/i18n';
import { Popover } from 'radix-ui';
import { useRef, useState } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { AutocompleteNotice } from './AutocompleteNotice';
import { AutocompleteTableOptions } from './AutocompleteTableOptions';
import { SearchField } from './SearchField';
import type { TableAutocompleteProps } from './TableAutocomplete.types';
import { useAutocomplete } from './use-autocomplete';
import { useImeQuery } from './use-ime-query';

/**
 * Desktop Table Autocomplete (1220:1330): the field stays in the layout; the listbox floats 4px below it at the
 * field's width, at most 320px high with inner scroll, flips above when there is no room and is portalled so no
 * parent clips it. Outside click and Escape close it; the footer shows the keyboard hint and the result count.
 */
export function TableAutocompleteDesktop<T>(props: TableAutocompleteProps<T>) {
  const t = useUiTranslations();
  const direction = getDirection(useLocale());
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const control = useAutocomplete({
    items: props.items,
    onSelect: props.onSelect,
    isDisabled: props.isItemDisabled,
    open,
    setOpen,
    onSubmit: props.onSubmit,
  });
  const ime = useImeQuery(props.query, (query) => {
    control.reset();
    setOpen(true);
    props.onQueryChange(query);
  });
  const results = props.status === 'results' && props.items.length > 0;
  const shown = open && !props.disabled;
  return (
    <Popover.Root open={shown} onOpenChange={setOpen}>
      <Popover.Anchor asChild>
        <div ref={anchor} className={props.className}>
          <SearchField
            label={props.label}
            hideLabel={props.hideLabel}
            placeholder={props.placeholder}
            hint={props.hint}
            disabled={props.disabled}
            value={ime.value}
            onChange={ime.onChange}
            onFocus={() => setOpen(true)}
            inputProps={{
              ...ime.compositionProps,
              role: 'combobox',
              autoComplete: 'off',
              'aria-autocomplete': 'list',
              'aria-expanded': shown && results,
              'aria-controls': control.listId,
              'aria-activedescendant': shown && results ? control.activeDescendant : undefined,
              onKeyDown: control.onKeyDown,
            }}
          />
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          dir={direction}
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={16}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onInteractOutside={(event) => {
            // the field is outside the layer but is where focus lives
            if (anchor.current?.contains(event.target as Node)) event.preventDefault();
          }}
          className={cn(
            'animate-fade-in border-line bg-surface shadow-medium z-50 flex flex-col overflow-hidden rounded-sm border outline-none',
            'max-h-[min(320px,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)]',
          )}
        >
          {results ? (
            <AutocompleteTableOptions {...props} control={control} />
          ) : (
            <AutocompleteNotice
              status={props.status === 'results' ? 'empty' : props.status}
              minLength={props.minLength}
              onRetry={props.onRetry}
            />
          )}
          {results ? (
            <div className="border-line text-body-s text-fg-tertiary flex shrink-0 justify-between gap-3 border-t px-4 py-2">
              <span>{t('autocomplete.keyboardHint')}</span>
              <span>{t('autocomplete.count', { count: props.items.length })}</span>
            </div>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
