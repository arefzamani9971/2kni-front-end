'use client';
import { appError, isAppError, type AppError } from '@dukani/domain';
import { useState } from 'react';
import { useAppErrorMessage } from '../i18n/use-app-error-message';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import type { SelectionSummaryProps } from './SelectionSummary.types';
import { useGroupSelection } from './use-group-selection';
import { useSelectionCount } from './use-selection-count';

/**
 * Toolbar line above the list (Figma Responsive Record List 652:805): the result count, or — while something is
 * selected — «N کالا انتخاب شده», bulk actions and «لغو انتخاب». It keeps its height, so selecting never shifts the
 * list. «Select all N results» appears once the visible group is fully selected and more results exist.
 */
export function SelectionSummary({
  store,
  unit,
  totalCount,
  groupIds,
  bulkActions,
  onSelectAllResults,
  leading,
}: SelectionSummaryProps) {
  const t = useUiTranslations();
  const message = useAppErrorMessage();
  const count = useSelectionCount(store);
  const group = useGroupSelection(store, groupIds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const selectAll = async () => {
    if (!onSelectAllResults) return;
    setBusy(true);
    setError(null);
    try {
      store.setMany(await onSelectAllResults(), true);
    } catch (caught) {
      setError(isAppError(caught) ? caught : appError('Bug', 'UNEXPECTED', String(caught)));
    } finally {
      setBusy(false);
    }
  };
  const offerAll = onSelectAllResults && group === 'all' && totalCount > count;
  return (
    <div
      className={cn(
        'flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 rounded-md px-3',
        count ? 'bg-brand-subtle' : 'bg-transparent',
      )}
    >
      {leading}
      <p className={cn('text-label-m', count ? 'text-fg-brand' : 'text-fg-secondary')} aria-live="polite">
        {count ? t('grid.selected', { count, unit }) : t('grid.count', { count: totalCount, unit })}
      </p>
      {offerAll ? (
        <Button variant="text" size="sm" loading={busy} onClick={() => void selectAll()}>
          {t('grid.selectAllResults', { count: totalCount, unit })}
        </Button>
      ) : null}
      {count ? (
        <div className="ms-auto flex flex-wrap items-center gap-2">
          {bulkActions}
          <Button variant="secondary" size="sm" onClick={store.clear}>
            {t('grid.clearSelection')}
          </Button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-body-s text-danger w-full">
          {message(error)}
        </p>
      ) : null}
    </div>
  );
}
