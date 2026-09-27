import type { Api, HttpClient } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';
import type { FileUploader, ProductLookup, PurchaseRepository, SupplierRepository } from './application/ports';
import { createHttpFileUploader, createHttpProductLookup, createHttpPurchaseRepository, createHttpSupplierRepository } from './infrastructure/http-purchasing';

export type PurchasingModule = {
  readonly purchases: PurchaseRepository;
  readonly suppliers: SupplierRepository;
  readonly products: ProductLookup;
  readonly files: FileUploader;
};

export const createPurchasingModule = (deps: { api: Api; http: HttpClient }): PurchasingModule => ({
  purchases: createHttpPurchaseRepository(deps.api),
  suppliers: createHttpSupplierRepository(deps.api),
  products: createHttpProductLookup(deps.api),
  files: createHttpFileUploader(deps.http),
});

export const [PurchasingModuleProvider, usePurchasingModule] = createModuleContext<PurchasingModule>('purchasing');
