import type { Dto } from '@dukani/contracts';
import { decimal } from '@dukani/domain';
import type { ProductFilter, StockTone } from './product.types';

/** API decimals (money and quantities) arrive as strings (BCR-01). */
const dec = (v: string | number) => decimal.of(v);
const isOut = (available: string | number) => !decimal.isPositive(dec(available));

export const stockTone = (p: Dto<'StoreProductSummaryDto'>): StockTone =>
  isOut(p.available) ? 'danger' : p.isLowStock ? 'warning' : 'neutral';

export const parseFilter = (params: {
  q?: string | null;
  stock?: string | null;
  cost?: string | null;
}): ProductFilter => ({
  q: params.q ?? '',
  stock: params.stock === 'Low' || params.stock === 'Out' ? params.stock : 'Any',
  cost: params.cost === 'Unknown' ? 'Unknown' : 'Any',
});
