import type {
  FileUploader,
  ProductLookup,
  PurchaseRepository,
  SupplierRepository,
} from './application/ports';
import type {
  BarcodeIdentifier,
  ProductPages,
  ReceiptCommands,
  ReceiptDrafts,
  SalePrices,
} from './application/receipt.ports';

export type PurchasingModule = {
  readonly purchases: PurchaseRepository;
  readonly suppliers: SupplierRepository;
  readonly products: ProductLookup;
  readonly files: FileUploader;
  /** F13 single-product receipts (continuous purchase, opening queue). */
  readonly receipts: ReceiptCommands;
  readonly productPages: ProductPages;
  readonly barcodes: BarcodeIdentifier;
  readonly salePrices: SalePrices;
  readonly receiptDrafts: ReceiptDrafts;
};
