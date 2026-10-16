'use client';
import { memo } from 'react';
import { useUiTranslations } from '../i18n/use-ui-translations';
import { cn } from '../lib/cn';
import { Link } from '../primitives/Link';
import type { GridItemProps } from './DataGrid.types';
import { cardLayoutOf } from './grid-columns';
import type { GridItemComponent } from './grid-item.types';
import { GridCardFields } from './GridCardFields';
import { NO_SELECTION } from './no-selection';
import { SelectionCheckbox } from './SelectionCheckbox';
import { useIsSelected } from './use-is-selected';

/**
 * Mobile card built from the same columns as the desktop row (Figma `Dukani/Record Card` 651:679): checkbox and
 * title, status, a two-column label/value grid, actions, and «اطلاعات تکمیلی» for `extra` columns. Memoized and
 * subscribed to its own id; long lists are windowed by GridCardList.
 */
export const GridCard = memo(function GridCard<T, S extends string>({
  row,
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
  const { title, status, fields, extra } = cardLayoutOf(columns);
  return (
    <article
      aria-label={rowLabel}
      className={cn(
        'border-line relative flex flex-col gap-3 rounded-sm border p-4',
        selected ? 'bg-brand-subtle' : 'bg-surface',
      )}
    >
      <div className="flex items-start gap-3">
        {selection ? (
          <SelectionCheckbox
            checked={selected}
            disabled={!selectable}
            label={t('grid.selectRow', { name: rowLabel })}
            onChange={(checked) => store.set(rowId, checked)}
          />
        ) : null}
        <div className="text-label-m text-fg-primary min-w-0 flex-1 font-semibold">
          {title && href ? (
            <Link href={href} className="focus-visible:outline-focus rounded-sm focus-visible:outline-2">
              {title.cell(row)}
            </Link>
          ) : (
            title?.cell(row)
          )}
        </div>
      </div>
      {status.map((column) => (
        <div key={column.id} className="text-label-s">
          {column.cell(row)}
        </div>
      ))}
      <GridCardFields row={row} columns={fields} />
      {rowActions ? (
        <div className="relative z-10 flex flex-col gap-2 *:w-full">{rowActions(row)}</div>
      ) : null}
      {extra.length ? (
        <details className="group/extra relative z-10">
          <summary className="text-label-m text-fg-brand cursor-pointer list-none py-2">
            {t('grid.moreInfo')}
          </summary>
          <GridCardFields row={row} columns={extra} />
        </details>
      ) : null}
    </article>
  );
}) as unknown as GridItemComponent;
