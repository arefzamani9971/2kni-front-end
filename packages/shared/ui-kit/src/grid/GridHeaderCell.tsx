'use client';
import { sortDirectionOf, type SortRule } from '@dukani/domain';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { Icon } from '../icons/Icon';
import { cn } from '../lib/cn';
import { COLUMN_ALIGN, COLUMN_WIDTH } from './DataGrid.constants';
import type { GridColumn } from './DataGrid.types';

/** Column header; a sortable column is a button with `aria-sort` on the cell (none → ascending → descending). */
export function GridHeaderCell<T, S extends string>({
  column,
  sort,
  onSort,
}: {
  column: GridColumn<T, S>;
  sort: readonly SortRule<S>[];
  onSort: (field: S) => void;
}) {
  const t = useUiTranslations();
  const { sortField } = column;
  const direction = sortField === undefined ? undefined : sortDirectionOf(sort, sortField);
  return (
    <th
      scope="col"
      aria-sort={
        sortField === undefined
          ? undefined
          : direction === 'asc'
            ? 'ascending'
            : direction === 'desc'
              ? 'descending'
              : 'none'
      }
      className={cn(
        'text-label-s text-fg-secondary h-12 px-3 font-medium',
        COLUMN_WIDTH[column.width ?? 'auto'],
        COLUMN_ALIGN[column.align ?? 'start'],
      )}
    >
      {sortField === undefined ? (
        column.header
      ) : (
        <button
          type="button"
          title={t('grid.sortBy', { name: column.header })}
          onClick={() => onSort(sortField)}
          className={cn(
            'group/sort hover:text-fg-primary focus-visible:outline-focus inline-flex items-center gap-1 rounded-sm focus-visible:outline-2',
            direction && 'text-fg-primary',
          )}
        >
          {column.header}
          <Icon
            name={direction === 'asc' ? 'sort-asc' : direction === 'desc' ? 'sort-desc' : 'sort'}
            size={14}
            className={cn(direction ? 'text-fg-brand' : 'opacity-40 group-hover/sort:opacity-80')}
          />
        </button>
      )}
    </th>
  );
}
