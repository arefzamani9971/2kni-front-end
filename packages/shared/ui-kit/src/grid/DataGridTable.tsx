'use client';
import { cycleSort } from '@dukani/domain';
import { useCallback, useMemo, useRef } from 'react';
import { Alert } from '../feedback/Alert';
import { PageState } from '../feedback/PageState';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Button } from '../primitives/Button';
import { SKELETON_ROWS } from './DataGrid.constants';
import type { DataGridProps } from './DataGrid.types';
import { GridHeaderCell } from './GridHeaderCell';
import { GridRow } from './GridRow';
import { GridSkeletonRows } from './GridSkeletonRows';
import { GroupSelectToggle } from './GroupSelectToggle';
import { Pager } from './Pager';
import { SelectionSummary } from './SelectionSummary';

/**
 * Desktop strategy of `DataGrid`: a real table with sortable headers, a «select this page» header checkbox when the
 * first column selects, memoized rows and the numbered pager. Changing page keeps the previous rows (dimmed, with
 * `aria-busy`) until the next page arrives; the next page is usually prefetched already.
 */
export function DataGridTable<T, S extends string>({
  source,
  desktopVariant = 'separated',
  columns,
  getRowId,
  getRowLabel,
  label,
  unit,
  selection,
  isRowSelectable,
  isRowSelected,
  bulkActions,
  onSelectAllResults,
  rowActions,
  getRowHref,
  empty,
}: DataGridProps<T, S>) {
  const t = useUiTranslations();
  const view = source.pageView;
  const noun = unit ?? t('grid.defaultUnit');
  const top = useRef<HTMLDivElement>(null);
  const ids = useMemo(() => view.items.map(getRowId), [view.items, getRowId]);
  const { setSort, setPage } = source;
  const sort = source.query.sort;
  const onSort = useCallback((field: S) => setSort(cycleSort(sort, field)), [setSort, sort]);
  const goTo = (page: number) => {
    setPage(page);
    top.current?.scrollIntoView?.({ block: 'nearest' });
  };
  const loading = view.status === 'idle' || view.status === 'loading';
  const retry = <Button onClick={view.retry}>{t('controls.retry')}</Button>;

  if (view.status === 'error') return <PageState kind="error" action={retry} />;
  if (view.status === 'ready' && view.totalCount === 0) return <>{empty ?? <PageState kind="empty" />}</>;
  return (
    <div ref={top} className="flex scroll-mt-4 flex-col gap-3">
      {selection ? (
        <SelectionSummary
          store={selection}
          unit={noun}
          totalCount={view.totalCount}
          groupIds={ids}
          bulkActions={bulkActions}
          onSelectAllResults={onSelectAllResults}
        />
      ) : null}
      {view.error ? <Alert tone="warning" title={t('grid.refreshFailed')} action={retry} /> : null}
      <div className="overflow-x-auto">
        <table
          aria-busy={loading || view.isPlaceholder}
          className={cn(
            'w-full text-start',
            desktopVariant === 'table'
              ? 'border-line border-collapse border'
              : 'border-separate [border-spacing:0_4px]',
          )}
        >
          <caption className="sr-only">{label}</caption>
          <thead>
            <tr>
              {selection ? (
                <th scope="col" className="w-12 ps-4 text-start">
                  <GroupSelectToggle store={selection} ids={ids} label={t('grid.selectPage')} />
                </th>
              ) : null}
              {columns.map((column) => (
                <GridHeaderCell key={column.id} column={column} sort={sort} onSort={onSort} />
              ))}
              {rowActions ? (
                <th scope="col" className="text-label-s text-fg-secondary px-3 text-end font-medium">
                  {t('grid.actions')}
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className={cn('transition-opacity', view.isPlaceholder && 'opacity-60')}>
            {loading ? (
              <GridSkeletonRows
                rows={SKELETON_ROWS}
                cells={columns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0)}
              />
            ) : (
              view.items.map((row) => {
                const rowId = getRowId(row);
                return (
                  <GridRow
                    key={rowId}
                    row={row}
                    desktopVariant={desktopVariant}
                    rowId={rowId}
                    rowLabel={getRowLabel(row)}
                    columns={columns}
                    selection={selection}
                    selectable={isRowSelectable?.(row) ?? true}
                    selected={isRowSelected?.(row)}
                    href={getRowHref?.(row)}
                    rowActions={rowActions}
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {loading ? null : (
        <Pager
          page={view.page}
          pageSize={view.pageSize}
          totalCount={view.totalCount}
          pageSizeOptions={source.pageSizeOptions}
          onPageChange={goTo}
          onPageSizeChange={source.setPageSize}
          label={label}
          unit={noun}
        />
      )}
    </div>
  );
}
