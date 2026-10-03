import type { Dto } from '@dukani/contracts';
import type { DecimalString, Money } from '@dukani/domain';

export type PurchaseStatus = Dto<'PurchaseStatus'>;

export type ListFilter = 'All' | 'Draft' | 'Finalized' | 'Corrected';

/** A line being edited in the receipt (quantities/money as canonical decimals). */
export type LineDraft = {
  readonly storeProductId: string;
  readonly title: string;
  readonly baseUnitName: string;
  readonly unitId: string;
  readonly unitName: string;
  readonly baseQtyPerUnit: DecimalString;
  readonly quantity: DecimalString;
  readonly costStatus: Dto<'CostStatus'>;
  readonly unitCost: Money | null;
  readonly productionDate: string | null;
  readonly expiryDate: string | null;
};
