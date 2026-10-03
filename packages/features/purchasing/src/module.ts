import type { Api, HttpClient } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';

import {
  createHttpFileUploader,
  createHttpProductLookup,
  createHttpPurchaseRepository,
  createHttpSupplierRepository,
} from './infrastructure/http-purchasing';
import type { PurchasingModule } from './module.types';

export const createPurchasingModule = (deps: { api: Api; http: HttpClient }): PurchasingModule => ({
  purchases: createHttpPurchaseRepository(deps.api),
  suppliers: createHttpSupplierRepository(deps.api),
  products: createHttpProductLookup(deps.api),
  files: createHttpFileUploader(deps.http),
});

export const [PurchasingModuleProvider, usePurchasingModule] =
  createModuleContext<PurchasingModule>('purchasing');
