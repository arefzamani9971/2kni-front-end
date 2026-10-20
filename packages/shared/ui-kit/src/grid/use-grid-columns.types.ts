import type { ReactNode } from 'react';
import type { GridColumn } from './DataGrid.types';

/** Feature-owned metadata; translation and row rendering are supplied at runtime. */
export type GridColumnDefinition<
  Id extends string,
  HeaderKey extends string,
  Sort extends string = string,
> = Omit<GridColumn<unknown, Sort>, 'id' | 'header' | 'cell'> & {
  readonly id: Id;
  readonly headerKey: HeaderKey;
};

export type UseGridColumnsOptions<T, Id extends string, HeaderKey extends string, Sort extends string> = {
  readonly definitions: readonly GridColumnDefinition<Id, HeaderKey, Sort>[];
  readonly translate: (key: HeaderKey) => string;
  readonly renderCell: (row: T, id: Id) => ReactNode;
};
