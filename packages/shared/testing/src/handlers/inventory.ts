import { round2 } from './money';
import type { Dto } from '@dukani/contracts';
import type { StoreProductRecord } from '../db/state';
import { computePrice } from './pricing';

/** Receives stock into a product and updates the moving average cost (BIZ-PUR-02/INV-03). */
export const receiveStock = (
  p: StoreProductRecord,
  qtyBase: number,
  costPerBase: number | null,
  status: Dto<'CostStatus'>,
) => {
  if (costPerBase !== null && status !== 'Unknown') {
    const known = p.averageCost !== null && p.costStatus !== 'Unknown' && p.onHand > 0;
    p.averageCost = known
      ? round2((p.onHand * p.averageCost! + qtyBase * costPerBase) / (p.onHand + qtyBase))
      : costPerBase;
    p.costStatus = status === 'Estimated' || (known && p.costStatus === 'Estimated') ? 'Estimated' : 'Known';
  } else if (p.averageCost === null) {
    p.costStatus = 'Unknown';
  }
  p.onHand = Math.round((p.onHand + qtyBase) * 1000) / 1000;
  if (p.pricing.method !== 'Manual')
    p.baseSalePrice = computePrice(p.pricing, p.averageCost) ?? p.baseSalePrice;
  p.version += 1;
};
