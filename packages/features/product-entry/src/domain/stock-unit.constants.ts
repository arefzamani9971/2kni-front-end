/** Server refusals of the stock unit that call for an explicit new choice (F12 §14), never a silent switch. */
export const STOCK_UNIT_REFUSALS: ReadonlySet<string> = new Set([
  'ENTRY_UNIT_UNAVAILABLE',
  'UNIT_NOT_PURCHASABLE',
]);
