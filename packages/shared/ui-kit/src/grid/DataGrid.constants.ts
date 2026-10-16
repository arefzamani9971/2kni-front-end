import type { GridColumnWidth } from './DataGrid.types';

/** Desktop column widths (Figma Data Grid Row columns); `auto` shares the remaining width. */
export const COLUMN_WIDTH: Readonly<Record<GridColumnWidth, string>> = {
  auto: '',
  xs: 'w-20',
  sm: 'w-28',
  md: 'w-40',
  lg: 'w-56',
  xl: 'w-72',
};

export const COLUMN_ALIGN = { start: 'text-start', end: 'text-end', center: 'text-center' } as const;

/** Skeleton size while the first page loads: the shape of the content, not a spinner. */
export const SKELETON_ROWS = 6;
export const SKELETON_CARDS = 3;

/** Start loading the next mobile page this far before the user reaches the end, so the wait is never seen. */
export const INFINITE_ROOT_MARGIN = '0px 0px 1200px 0px';

/** Local (in-memory) lists render this many more cards per «load more». */
export const LOCAL_CHUNK = 20;
export const CARD_ESTIMATE = 300;
export const CARD_OVERSCAN = 5;
