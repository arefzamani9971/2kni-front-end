export type PagerProps = {
  /** Page shown (1-based). */
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly pageSizeOptions: readonly number[];
  readonly onPageChange: (page: number) => void;
  readonly onPageSizeChange: (pageSize: number) => void;
  /** Name of the list, used in the navigation landmark. */
  readonly label: string;
  /** Noun in «۲۱–۴۰ از ۴۱ کالا». */
  readonly unit: string;
};
