import type { ReactNode } from 'react';
import type { GridItemProps } from './DataGrid.types';

/** Generic signature of the memoized row/card (React.memo drops the generics). */
export type GridItemComponent = <T, S extends string>(props: GridItemProps<T, S>) => ReactNode;
