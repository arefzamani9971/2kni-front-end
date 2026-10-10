import type { Permission } from './permission.types';

/** The 19 independent store permissions of the backend `StorePermission` (BIZ-ACC-02). Owners have all. */
export const PERMISSIONS = [
  'sale.cash',
  'sale.credit',
  'sale.discount',
  'sale.price_override',
  'sale.correct',
  'debt.settle',
  'product.manage',
  'price.change',
  'stock.view',
  'stock.adjust',
  'purchase.manage',
  'purchase.correct',
  'customer.manage',
  'customer.merge',
  'report.financial',
  'data.export',
  'staff.manage',
  'store.settings',
  'order.manage',
] as const;

export const STAFF_DEFAULT_PERMISSIONS: readonly Permission[] = [
  'sale.cash',
  'product.manage',
  'customer.manage',
  'stock.view',
];
