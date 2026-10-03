import type { Dto } from '@dukani/contracts';
import type { MockPriceRule } from './wire.types';

export type ProductSeed = {
  key: string;
  onHand: number;
  cost: number | null;
  costStatus: Dto<'CostStatus'>;
  pricing: MockPriceRule;
  price: number | null;
  low?: number;
};
