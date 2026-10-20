'use client';
import { useMemo } from 'react';
import type { GridColumn } from './DataGrid.types';
import type { UseGridColumnsOptions } from './use-grid-columns.types';

/** Keep definitions at module scope and pass a stable translator and cell renderer. */
export function useGridColumns<T, Id extends string, HeaderKey extends string, Sort extends string = string>({
  definitions,
  translate,
  renderCell,
}: UseGridColumnsOptions<T, Id, HeaderKey, Sort>): readonly GridColumn<T, Sort>[] {
  return useMemo(
    () =>
      definitions.map(({ headerKey, ...column }) => ({
        ...column,
        header: translate(headerKey),
        cell: (row: T) => renderCell(row, column.id),
      })),
    [definitions, translate, renderCell],
  );
}
