import type { Api } from '@dukani/http';
import type { BarcodeIdentifier } from '../application/receipt.ports';

/**
 * `GET …/barcodes/{code}` → the active goods product of this store the code names, with the unit it is printed on.
 * A catalog-only, archived or service match is not a product to receive into; two products are ambiguous.
 */
export const createHttpBarcodeIdentifier = (api: Api): BarcodeIdentifier => ({
  async identify(storeId, code, signal) {
    const lookup = await api.get('/api/v1/stores/{storeId}/barcodes/{code}', {
      path: { storeId, code },
      signal,
    });
    const usable = lookup.matches.filter(
      (m) => !!m.storeProductId && m.storeProductStatus === 'Active' && m.itemKind === 'Goods',
    );
    const products = new Set(usable.map((m) => m.storeProductId));
    if (products.size > 1) return { kind: 'ambiguous' };
    const match = usable[0];
    if (!match?.storeProductId) return { kind: 'not-in-store' };
    return {
      kind: 'product',
      productId: match.storeProductId,
      // the printed unit even when retired: the form then asks for a new choice instead of switching (F12 AC07)
      unitId: match.storeProductUnitId ?? null,
      title: match.title,
    };
  },
});
