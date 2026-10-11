import { decimal, type DecimalString } from '@dukani/domain';
import type { BulkReceipt, BulkRow } from './bulk-draft.types';
import type { ScanLookup, ScanMatch } from './bulk-scan.types';
import type { EntryDraft } from './entry-draft.types';

/**
 * A scan is added straight to the bulk list only for one active, sellable goods unit of this store; anything else
 * (catalog-only, several matches, service, archived) goes to the explicit selection flow.
 */
export function directScanMatch<M extends ScanMatch>(
  lookup: ScanLookup & { matches: readonly M[] },
): M | null {
  const match = lookup.matches[0];
  if (lookup.kind !== 'StoreProduct' || lookup.matches.length !== 1 || !match) return null;
  if (match.itemKind !== 'Goods' || match.unitActive === false) return null;
  if (match.catalogStatus === 'Archived' || match.storeProductStatus === 'Archived') return null;
  return match;
}

/** One received unit of the scanned item on the shared receipt, cost still unknown. */
export function scannedRow(
  clientRowId: string,
  entry: EntryDraft,
  unitKey: string,
  receipt: BulkReceipt,
  quantity: DecimalString = decimal.of(1),
): BulkRow {
  return {
    clientRowId,
    entry: {
      ...entry,
      stockDecided: true,
      stock: {
        kind: receipt.kind,
        unitKey,
        quantity,
        costStatus: 'Unknown',
        unitCost: null,
        supplierId: null,
        supplierName: null,
        supplierInvoiceNo: '',
        productionDate: null,
        expiryDate: null,
      },
    },
  };
}
