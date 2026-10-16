import type { GridColumn } from './DataGrid.types';

export type CardLayout<T, S extends string> = {
  readonly title: GridColumn<T, S> | undefined;
  readonly status: readonly GridColumn<T, S>[];
  readonly fields: readonly GridColumn<T, S>[];
  readonly extra: readonly GridColumn<T, S>[];
};

/** Splits the columns into the regions of the mobile card; the first column is the title unless one is marked. */
export function cardLayoutOf<T, S extends string>(columns: readonly GridColumn<T, S>[]): CardLayout<T, S> {
  const title = columns.find((column) => column.card === 'title') ?? columns[0];
  const rest = columns.filter((column) => column !== title);
  return {
    title,
    status: rest.filter((column) => column.card === 'status'),
    fields: rest.filter((column) => (column.card ?? 'field') === 'field' || column.card === 'control'),
    extra: rest.filter((column) => column.card === 'extra'),
  };
}

/** Columns the server can sort by, in display order. */
export const sortableColumnsOf = <T, S extends string>(columns: readonly GridColumn<T, S>[]) =>
  columns.filter((column): column is GridColumn<T, S> & { sortField: S } => column.sortField !== undefined);
