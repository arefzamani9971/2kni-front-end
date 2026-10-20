import { toApiMoney } from '@dukani/domain';
import type { Api } from '@dukani/http';
import type { SalePrices } from '../application/receipt.ports';

/**
 * The explicit base sale price (F16 `PUT …/pricing`) on the product's current version: the receipt just changed the
 * product (cost), so the version is read right before. Package prices are left as they are (`unitPrices` absent).
 */
export const createHttpSalePrices = (api: Api): SalePrices => ({
  async setBasePrice(storeId, productId, amount, reason) {
    const product = await api.get('/api/v1/stores/{storeId}/products/{productId}', {
      path: { storeId, productId },
    });
    await api.put('/api/v1/stores/{storeId}/products/{productId}/pricing', {
      path: { storeId, productId },
      body: {
        pricing: {
          method: 'Manual',
          manualPriceAmount: toApiMoney(amount),
          markupPercent: null,
          fixedProfitAmount: null,
          roundingStepAmount: null,
          roundingDirection: product.pricing?.roundingDirection ?? 'Nearest',
        },
        reason,
        unitPrices: null,
        expectedVersion: product.version,
      },
    });
  },
});
