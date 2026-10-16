'use client';
import { memo } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Link } from '../primitives/Link';
import { COLUMN_ALIGN } from './DataGrid.constants';
import type { GridItemProps } from './DataGrid.types';
import type { GridItemComponent } from './grid-item.types';
import { NO_SELECTION } from './no-selection';
import { SelectionCheckbox } from './SelectionCheckbox';
import { useIsSelected } from './use-is-selected';

/**
 * One desktop row (Figma `Dukani/Data Grid Row` 651:628): rounded bordered strip, brand-subtle when selected.
 * Memoized and subscribed to its own id, so selecting a row or typing elsewhere never re-renders the other rows.
 * With `href`, only the title is a link; editable cells and actions retain their own pointer targets.
 */
export const GridRow = memo(function GridRow<T, S extends string>({
  row,
  desktopVariant = 'separated',
  rowId,
  rowLabel,
  columns,
  selection,
  selectable,
  selected: selectedOverride,
  href,
  rowActions,
}: GridItemProps<T, S>) {
  const t = useUiTranslations();
  const store = selection ?? NO_SELECTION;
  const storedSelection = useIsSelected(store, rowId);
  const selected = selectedOverride ?? storedSelection;
  const title = columns.find((column) => column.card === 'title') ?? columns[0];
  const cell = cn(
    'border-line h-16 px-3',
    desktopVariant === 'table'
      ? 'border-b'
      : 'border-y first:rounded-s-sm first:border-s last:rounded-e-sm last:border-e',
    selected ? 'bg-brand-subtle' : 'bg-surface group-hover/row:bg-muted',
  );
  return (
    <tr className="group/row relative">
      {selection ? (
        <td className={cn(cell, 'w-12 ps-4')}>
          <SelectionCheckbox
            checked={selected}
            disabled={!selectable}
            label={t('grid.selectRow', { name: rowLabel })}
            onChange={(checked) => store.set(rowId, checked)}
          />
        </td>
      ) : null}
      {columns.map((column) => (
        <td
          key={column.id}
          className={cn(cell, 'text-body-m text-fg-primary', COLUMN_ALIGN[column.align ?? 'start'])}
        >
          {href && column === title ? (
            <Link
              href={href}
              className="text-label-m focus-visible:outline-focus rounded-sm font-semibold hover:underline focus-visible:outline-2"
            >
              {column.cell(row)}
            </Link>
          ) : (
            column.cell(row)
          )}
        </td>
      ))}
      {rowActions ? (
        <td className={cn(cell, 'relative z-10 w-px pe-4 text-end whitespace-nowrap')}>{rowActions(row)}</td>
      ) : null}
    </tr>
  );
}) as unknown as GridItemComponent;
