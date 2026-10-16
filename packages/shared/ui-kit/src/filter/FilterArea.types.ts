import type { ReactNode } from 'react';

/** Same contract for the desktop panel and the mobile sheet (PAT-FILTER-01). */
export type FilterAreaProps = {
  /** Default «جست‌وجو و فیلتر». */
  readonly title?: string;
  /** Free-text field: shares the desktop field row; always visible above the mobile list. */
  readonly search?: ReactNode;
  /** The other fields (select, checkbox, date range…); desktop grid, mobile sheet. */
  readonly children?: ReactNode;
  /** Boolean options below the aligned fields; included in the mobile filter sheet. */
  readonly options?: ReactNode;
  /** Applied filters that differ from the defaults (badge). */
  readonly appliedCount: number;
  /** The draft differs from what is applied (Apply would change the list). */
  readonly dirty: boolean;
  readonly onApply: () => void;
  /** Returns the draft to the use-case defaults; applying stays explicit. */
  readonly onReset: () => void;
  /** `ActiveFilterChips` of the applied filters. */
  readonly chips?: ReactNode;
  /** Desktop panel open on first visit (default true). */
  readonly defaultOpen?: boolean;
  /** The list is fetching after Apply. */
  readonly busy?: boolean;
};
