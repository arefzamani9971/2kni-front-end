import type { ReactNode } from 'react';
import type { SelectionStore } from './selection-store.types';

export type SelectionSummaryProps = {
  readonly store: SelectionStore;
  readonly unit: string;
  /** Results of the applied query (all pages). */
  readonly totalCount: number;
  /** The visible group (page or loaded cards); «select all results» is offered once it is fully selected. */
  readonly groupIds: readonly string[];
  readonly bulkActions?: ReactNode;
  readonly onSelectAllResults?: () => Promise<readonly string[]>;
  /** Leading control, e.g. the mobile «select loaded» checkbox. */
  readonly leading?: ReactNode;
};
