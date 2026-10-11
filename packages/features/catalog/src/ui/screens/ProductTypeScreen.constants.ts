import type { CatalogStatus } from '../../domain/catalog.types';

/** Badge tone of each catalog status on the product type page. */
export const STATUS_TONE: Record<CatalogStatus, 'neutral' | 'warning' | 'success'> = {
  Private: 'neutral',
  PendingReview: 'warning',
  Public: 'success',
  Archived: 'neutral',
};
