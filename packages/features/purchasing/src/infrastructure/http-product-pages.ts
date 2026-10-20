import { decimal, fromApiMoney } from '@dukani/domain';
import type { Api } from '@dukani/http';
import type { ProductPages } from '../application/receipt.ports';

/** `ListQuery` → `StoreProductPageQuery` (goods only: receipts never take a service) and rows → `ProductPageRow`. */
export const createHttpProductPages = (api: Api): ProductPages => ({
  async page(storeId, query, signal) {
    const result = await api.post('/api/v1/stores/{storeId}/products/search', {
      path: { storeId },
      body: {
        page: query.page,
        pageSize: query.pageSize,
        sortModel: query.sort.map(({ field, direction }) => ({ colId: field, sort: direction })),
        q: query.filter.q || undefined,
        kind: 'Goods',
        withoutStockHistory: query.filter.withoutStockHistory ?? false,
      },
      signal,
    });
    return {
      ...result,
      items: result.items.map((row) => ({
        id: row.product.id,
        title: row.product.title,
        sku: row.product.sku,
        barcode: row.barcode ?? null,
        baseUnitName: row.product.baseUnitName,
        onHand: decimal.of(row.product.onHand),
        salePrice: fromApiMoney(row.product.baseSalePriceAmount),
        hasStockHistory: row.hasStockHistory,
      })),
    };
  },
});
