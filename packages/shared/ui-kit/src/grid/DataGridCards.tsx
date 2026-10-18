'use client';
import { useMemo } from 'react';
import { PageState } from '../feedback/PageState';
import { Alert } from '../feedback/Alert';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import { SKELETON_CARDS } from './DataGrid.constants';
import type { DataGridProps } from './DataGrid.types';
import { GridCardList } from './GridCardList';
import { GridCard } from './GridCard';
import { GridSkeletonCards } from './GridSkeletonCards';
import { GridSortSelect } from './GridSortSelect';
import { GroupSelectToggle } from './GroupSelectToggle';
import { sortableColumnsOf } from './grid-columns';
import { ListEnd } from './ListEnd';
import { SelectionSummary } from './SelectionSummary';
import { uniqueRows } from './unique-rows';

/**
 * Mobile strategy of `DataGrid`: project cards from the same columns, appended page by page as the user scrolls
 * (the server is paged, the user never sees it). Sort uses the same fields as the desktop headers; «select all»
 * covers the loaded cards. Long lists use variable-height windowing while retaining the focused card.
 */
export function DataGridCards<T, S extends string>({
  source,
  columns,
  getRowId,
  getRowLabel,
  label,
  unit,
  selection,
  isRowSelectable,
  bulkActions,
  onSelectAllResults,
  rowActions,
  getRowHref,
  empty,
}: DataGridProps<T, S>) {
  const t = useUiTranslations();
  const view = source.infiniteView;
  const noun = unit ?? t('grid.defaultUnit');
  const rows = useMemo(() => uniqueRows(view.items, getRowId), [view.items, getRowId]);
  const ids = useMemo(() => rows.map((entry) => entry.id), [rows]);
  const sortable = useMemo(() => sortableColumnsOf(columns), [columns]);
  const loading = view.status === 'idle' || view.status === 'loading';

  if (view.status === 'error')
    return <PageState kind="error" action={<Button onClick={view.retry}>{t('controls.retry')}</Button>} />;
  if (view.status === 'ready' && !rows.length) return <>{empty ?? <PageState kind="empty" />}</>;
  return (
    <div className="flex flex-col gap-3">
      {view.error ? (
        <Alert
          tone="warning"
          title={t('grid.refreshFailed')}
          action={<Button onClick={view.retry}>{t('controls.retry')}</Button>}
        />
      ) : null}
      {sortable.length ? (
        <GridSortSelect columns={sortable} sort={source.query.sort} onSort={source.setSort} />
      ) : null}
      {loading ? null : selection ? (
        <SelectionSummary
          store={selection}
          unit={noun}
          totalCount={view.totalCount}
          groupIds={ids}
          bulkActions={bulkActions}
          onSelectAllResults={onSelectAllResults}
          leading={<GroupSelectToggle store={selection} ids={ids} label={t('grid.selectLoaded')} />}
        />
      ) : (
        <p className="text-label-m text-fg-secondary">
          {t('grid.count', { count: view.totalCount, unit: noun })}
        </p>
      )}
      {loading ? (
        <ul aria-label={label} aria-busy className="flex flex-col gap-3">
          <GridSkeletonCards count={SKELETON_CARDS} />
        </ul>
      ) : (
        <div className={cn('transition-opacity', view.isPlaceholder && 'opacity-60')}>
          <GridCardList rows={rows} label={label} busy={view.isPlaceholder}>
            {(row, id) => (
              <GridCard
                row={row}
                rowId={id}
                rowLabel={getRowLabel(row)}
                columns={columns}
                selection={selection}
                selectable={isRowSelectable?.(row) ?? true}
                href={getRowHref?.(row)}
                rowActions={rowActions}
              />
            )}
          </GridCardList>
        </div>
      )}
      {loading ? null : <ListEnd view={view} unit={noun} />}
    </div>
  );
}
