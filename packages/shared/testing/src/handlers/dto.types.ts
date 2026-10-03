import type { Dto } from '@dukani/contracts';

/** Totals with discount/extra costs allocated by line amount (BIZ-PUR-02). */
/** Numeric form of a purchase line (the mock computes in numbers; the DTO carries strings). */
export type NumericLine = {
  [K in keyof Dto<'PurchaseLineDto'>]: Dto<'PurchaseLineDto'>[K] extends string | null | undefined
    ? K extends DecimalKeys
      ? number | null
      : Dto<'PurchaseLineDto'>[K]
    : Dto<'PurchaseLineDto'>[K];
};

export type DecimalKeys =
  | 'baseQtyPerUnit'
  | 'quantity'
  | 'qtyBase'
  | 'unitCostAmount'
  | 'lineAmount'
  | 'allocatedDiscountAmount'
  | 'allocatedExtraAmount'
  | 'costPerBaseAmount'
  | 'manufacturerPriceAmount'
  | 'printedPriceAmount';
