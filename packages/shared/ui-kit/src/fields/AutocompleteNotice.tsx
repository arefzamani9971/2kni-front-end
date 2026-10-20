'use client';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Button } from '../primitives/Button';
import { Spinner } from '../primitives/Spinner';
import type { AutocompleteStatus } from './TableAutocomplete.types';

/**
 * The popup body when there is nothing to choose (Autocomplete Listbox 1313:1507): the minimum hint (no request),
 * the short wait before a request, loading, empty, or an error with a retry of the same query.
 */
export function AutocompleteNotice({
  status,
  minLength = 3,
  onRetry,
}: {
  status: Exclude<AutocompleteStatus, 'results'>;
  minLength?: number;
  onRetry?: () => void;
}) {
  const t = useUiTranslations();
  const text =
    status === 'belowMinimum'
      ? t('autocomplete.belowMinimum', { count: minLength })
      : status === 'debouncing'
        ? t('autocomplete.waiting')
        : status === 'loading'
          ? t('autocomplete.loading')
          : status === 'empty'
            ? t('autocomplete.empty')
            : t('autocomplete.error');
  return (
    <div
      role="status"
      aria-live="polite"
      className="text-body-m text-fg-secondary flex items-center gap-3 p-4"
    >
      {status === 'loading' ? <Spinner size={18} label={text} /> : null}
      <span className="min-w-0 flex-1">{text}</span>
      {status === 'error' && onRetry ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onRetry}
        >
          {t('controls.retry')}
        </Button>
      ) : null}
    </div>
  );
}
