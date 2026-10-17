import { decimal } from '@dukani/domain';

/**
 * Heading of a barcode lookup result. The designed branches have their own (Figma 312:663 / 312:9044 package found,
 * 312:712 / 312:9075 conflict); the others keep the generic «نتیجهٔ بارکد».
 */
export const lookupTitleKey = (
  kind: string | undefined,
  matches: readonly { readonly baseQty: string }[],
): 'lookup.conflictTitle' | 'lookup.packageTitle' | 'barcodeResults' => {
  if (kind === 'Conflict') return 'lookup.conflictTitle';
  const single = matches.length === 1 ? matches[0] : undefined;
  if (
    (kind === 'StoreProduct' || kind === 'GlobalCatalog') &&
    single &&
    decimal.gt(decimal.of(single.baseQty), decimal.of(1))
  )
    return 'lookup.packageTitle';
  return 'barcodeResults';
};
