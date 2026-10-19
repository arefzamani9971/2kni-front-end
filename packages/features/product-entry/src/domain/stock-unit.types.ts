/**
 * The entry unit the stock step starts with. `key` is empty when the seller has to choose: `stale` = the unit the
 * draft held is no longer a purchase unit; `scan` = the scanned barcode's unit cannot be used to purchase.
 */
export type StockUnitChoice = {
  readonly key: string;
  readonly notice: 'stale' | 'scan' | null;
};
