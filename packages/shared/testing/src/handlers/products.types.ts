import type { Dto } from '@dukani/contracts';
import type { CatalogItemRecord } from '../db/reference.types';
import type { StoreProductRecord } from '../db/state';

export type Plan = {
  item: CatalogItemRecord;
  existing?: StoreProductRecord;
  title: string;
  baseUnitName: string;
  entryUnitIndex: number | null;
  entryCatalogUnitId: string | null;
  qtyBase: number | null;
  conversionText: string | null;
  lineAmount: number | null;
  costPerBase: number | null;
  costStatus: Dto<'CostStatus'>;
  salePrice: number | null;
  isBelowCost: boolean;
  warnings: string[];
};
