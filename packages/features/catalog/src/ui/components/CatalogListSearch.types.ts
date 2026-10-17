import type { CatalogItemFilter, CatalogTypeSummary } from '../../domain/catalog.types';

export type CatalogListSearchProps = {
  /** The list's applied filter (`list.query.filter`). */
  readonly applied: CatalogItemFilter;
  /** Applies a complete filter: list page 1 and the URL. */
  readonly onApply: (filter: CatalogItemFilter) => void;
  readonly types: readonly CatalogTypeSummary[] | undefined;
};
