import type { ListQuery, ListSource } from '@dukani/domain';
import type { ReactNode } from 'react';
import type { SelectionStore } from './selection-store.types';

export type GridDesktopVariant = 'separated' | 'table';

export type GridColumnWidth = 'auto' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Where a column goes on the mobile card (Figma `Dukani/Record Card` 651:679): `title` beside the checkbox,
 * `status` under it, `field` in the two-column label/value grid, `extra` inside «اطلاعات تکمیلی», `hidden` not at all.
 */
export type GridCardPlacement = 'title' | 'status' | 'field' | 'control' | 'extra' | 'hidden';

/** One column, defined once for both the desktop grid and the mobile card. Keep the array stable (module const). */
export type GridColumn<T, S extends string = string> = {
  readonly id: string;
  /** Header, card field label and sort option; text so every presentation stays accessible. */
  readonly header: string;
  readonly cell: (row: T) => ReactNode;
  /** Server sort field (enum of the endpoint, PAT-LIST-01). Present = sortable header and mobile sort option. */
  readonly sortField?: S;
  /** Numbers and money: `end`. */
  readonly align?: 'start' | 'end' | 'center';
  readonly width?: GridColumnWidth;
  /** Default `field`; the first column is the title when no column is marked `title`. */
  readonly card?: GridCardPlacement;
};

/** What the grid reads from a list source (`useAppList` or `useLocalList`); the filter is not its business. */
export type GridSource<T, S extends string = string> = Pick<
  ListSource<T, never, S>,
  'pageSizeOptions' | 'setPage' | 'setPageSize' | 'setSort' | 'present' | 'pageView' | 'infiniteView'
> & { readonly query: Pick<ListQuery<unknown, S>, 'page' | 'pageSize' | 'sort'> };

export type DataGridProps<T, S extends string = string> = {
  /** Desktop visual treatment; does not change query, selection, or the mobile card strategy. */
  readonly desktopVariant?: GridDesktopVariant;
  readonly source: GridSource<T, S>;
  readonly columns: readonly GridColumn<T, S>[];
  readonly getRowId: (row: T) => string;
  /** Plain-text name of a row for checkboxes and links («انتخاب خودکار آبی»). */
  readonly getRowLabel: (row: T) => string;
  /** Caption of the table / name of the list. */
  readonly label: string;
  /** Noun used in counts: «۳ کالا انتخاب شده»، «۱–۲۰ از ۴۱ کالا». Default «مورد». */
  readonly unit?: string;
  /** Turns on the checkbox column, the header «select all» and the selection bar. */
  readonly selection?: SelectionStore;
  readonly isRowSelectable?: (row: T) => boolean;
  /** Selected treatment for domain-owned editable selections; does not add another checkbox or store. */
  readonly isRowSelected?: (row: T) => boolean;
  /** Shown in the selection bar while something is selected (bulk archive, export…). */
  readonly bulkActions?: ReactNode;
  /**
   * «Select all N results» across pages. Must come from a server snapshot of the applied query (PAT-LIST-01),
   * never from fetching every page in the browser.
   */
  readonly onSelectAllResults?: () => Promise<readonly string[]>;
  /** Per-row actions (e.g. «جزئیات»); a stable function. Desktop: last column. Mobile: card footer. */
  readonly rowActions?: (row: T) => ReactNode;
  /** Makes the row's title a link to the record. */
  readonly getRowHref?: (row: T) => string | undefined;
  /** Replaces the default empty state (e.g. «no result for this filter» with a reset action). */
  readonly empty?: ReactNode;
};

/** Props of one desktop row or mobile card (strategy internals). */
export type GridItemProps<T, S extends string> = {
  readonly desktopVariant?: GridDesktopVariant;
  readonly row: T;
  readonly rowId: string;
  readonly rowLabel: string;
  readonly columns: readonly GridColumn<T, S>[];
  readonly selection?: SelectionStore;
  readonly selectable: boolean;
  readonly selected?: boolean;
  readonly href?: string;
  readonly rowActions?: (row: T) => ReactNode;
};

/** Generic signature of the memoized facade (React.memo drops the generics). */
export type DataGridComponent = <T, S extends string = string>(props: DataGridProps<T, S>) => ReactNode;
