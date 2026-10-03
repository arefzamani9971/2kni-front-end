import type {
  FileUploader,
  ProductLookup,
  PurchaseRepository,
  SupplierRepository,
} from './application/ports';

export type PurchasingModule = {
  readonly purchases: PurchaseRepository;
  readonly suppliers: SupplierRepository;
  readonly products: ProductLookup;
  readonly files: FileUploader;
};
