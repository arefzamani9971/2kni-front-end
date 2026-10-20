'use client';
import { getDirection, useLocale } from '@dukani/i18n';
import { Dialog as RDialog } from 'radix-ui';
import { useRef, type RefObject } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { useHistoryDismiss } from '../overlays/use-history-dismiss';
import { IconButton } from '../primitives/IconButton';
import { AutocompleteCardOptions } from './AutocompleteCardOptions';
import { AutocompleteNotice } from './AutocompleteNotice';
import { SearchField } from './SearchField';
import type { TableAutocompleteProps } from './TableAutocomplete.types';
import { useAutocomplete } from './use-autocomplete';
import { useImeQuery } from './use-ime-query';

/**
 * Mobile Autocomplete Fullscreen (1220:1450): input and results together in a full-screen layer that fades in;
 * the header with the input and the X close stays put while results scroll. X, Escape and system Back close it
 * without a choice and focus returns to the field that opened it; a choice closes it once.
 */
export function AutocompleteFullscreen<T>({
  open,
  onOpenChange,
  returnFocusRef,
  ...props
}: TableAutocompleteProps<T> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const t = useUiTranslations();
  const direction = getDirection(useLocale());
  const input = useRef<HTMLInputElement>(null);
  useHistoryDismiss(open, () => onOpenChange(false));
  const control = useAutocomplete({
    items: props.items,
    onSelect: props.onSelect,
    isDisabled: props.isItemDisabled,
    open,
    setOpen: onOpenChange,
    onSubmit: props.onSubmit,
  });
  const ime = useImeQuery(props.query, (query) => {
    control.reset();
    props.onQueryChange(query);
  });
  const results = props.status === 'results' && props.items.length > 0;
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Content
          dir={direction}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            input.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
          className="animate-fade-in bg-surface fixed inset-0 z-50 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] outline-none"
        >
          <RDialog.Title className="sr-only">{props.label}</RDialog.Title>
          <div className="border-line flex shrink-0 items-center gap-2 border-b p-3">
            <SearchField
              ref={input}
              className="min-w-0 flex-1"
              label={props.label}
              hideLabel
              placeholder={props.placeholder}
              value={ime.value}
              onChange={ime.onChange}
              inputProps={{
                ...ime.compositionProps,
                role: 'combobox',
                autoComplete: 'off',
                'aria-autocomplete': 'list',
                'aria-expanded': results,
                'aria-controls': control.listId,
                'aria-activedescendant': results ? control.activeDescendant : undefined,
                onKeyDown: control.onKeyDown,
              }}
            />
            <IconButton
              icon="close"
              label={t('autocomplete.close')}
              className="size-11 shrink-0"
              onClick={() => onOpenChange(false)}
            />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            {results ? (
              <AutocompleteCardOptions {...props} control={control} />
            ) : (
              <AutocompleteNotice
                status={props.status === 'results' ? 'empty' : props.status}
                minLength={props.minLength}
                onRetry={props.onRetry}
              />
            )}
          </div>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
