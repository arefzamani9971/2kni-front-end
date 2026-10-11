import type { ItemKind } from '@dukani/domain';

/** Raw values of the local edit form (PRD-LOCAL-EDIT): text as typed, service cost as typed. */
export type LocalInfoValues = {
  readonly localTitle: string;
  readonly localNote: string;
  /** Services only: the seller changes the manual cost on purpose (F11 `setServiceCost`). */
  readonly changeServiceCost: boolean;
  /** Canonical decimal string or null (unknown cost); used only when `changeServiceCost`. */
  readonly serviceCostAmount: string | null;
};

/** What a local edit reads from a store product (the server product DTO satisfies it). */
export type LocalProduct = {
  readonly kind: ItemKind;
  readonly version: number;
  readonly catalogTitle: string;
  readonly localTitle?: string | null;
  readonly localNote?: string | null;
  readonly shortcut?: string | null;
  readonly serviceCostAmount?: string | null;
};

/** The `PUT …/local` body (F11 §5); `expectedVersion` is the version the form was read at. */
export type LocalInfoRequest = {
  readonly localTitle: string | null;
  readonly localNote: string | null;
  readonly expectedVersion: number;
  readonly shortcut: string | null;
  readonly setServiceCost: boolean;
  readonly serviceCostAmount: string | null;
};

export type LocalConflictField = 'localTitle' | 'localNote' | 'serviceCost';
