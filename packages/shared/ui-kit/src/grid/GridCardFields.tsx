import type { GridColumn } from './DataGrid.types';
import { cn } from '../lib/cn';

/** Label/value pairs of a card in two columns (Figma Record Card: «موجودی ۱۷», «قیمت فروش (تومان) ۱۰٬۰۰۰»). */
export function GridCardFields<T, S extends string>({
  row,
  columns,
}: {
  row: T;
  columns: readonly GridColumn<T, S>[];
}) {
  if (!columns.length) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {columns.map((column) => (
        <div
          key={column.id}
          className={cn('flex min-w-0 flex-col gap-1', column.card === 'control' && 'col-span-2')}
        >
          <dt className={column.card === 'control' ? 'sr-only' : 'text-body-s text-fg-secondary'}>
            {column.header}
          </dt>
          <dd className="text-label-m text-fg-primary break-words">{column.cell(row)}</dd>
        </div>
      ))}
    </dl>
  );
}
