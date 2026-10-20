import type { Api, HttpClient } from '@dukani/http';
import { createModuleContext, type DraftStore } from '@dukani/platform';

import { createHttpBarcodeIdentifier } from './infrastructure/http-barcode-identifier';
import { createHttpProductPages } from './infrastructure/http-product-pages';
import {
  createHttpFileUploader,
  createHttpProductLookup,
  createHttpPurchaseRepository,
  createHttpSupplierRepository,
} from './infrastructure/http-purchasing';
import { createHttpReceiptCommands } from './infrastructure/http-receipts';
import { createHttpSalePrices } from './infrastructure/http-sale-prices';
import { createReceiptDrafts } from './infrastructure/receipt-draft-repository';
import type { PurchasingModule } from './module.types';

export const createPurchasingModule = (deps: {
  api: Api;
  http: HttpClient;
  drafts: DraftStore;
  userId: () => string;
}): PurchasingModule => ({
  purchases: createHttpPurchaseRepository(deps.api),
  suppliers: createHttpSupplierRepository(deps.api),
  products: createHttpProductLookup(deps.api),
  files: createHttpFileUploader(deps.http),
  receipts: createHttpReceiptCommands(deps.api),
  productPages: createHttpProductPages(deps.api),
  barcodes: createHttpBarcodeIdentifier(deps.api),
  salePrices: createHttpSalePrices(deps.api),
  receiptDrafts: createReceiptDrafts(deps.drafts, deps.userId),
});

export const [PurchasingModuleProvider, usePurchasingModule] =
  createModuleContext<PurchasingModule>('purchasing');
