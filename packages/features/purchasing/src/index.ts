/** Purchasing feature (scope:seller): receipts from draft to finalize, suppliers, attachments (F17–F21, F71). */
export { createPurchasingModule, PurchasingModuleProvider, usePurchasingModule, type PurchasingModule } from './module';
export type { FileUploader, ProductLookup, PurchaseRepository, SupplierRepository } from './application/ports';
export { purchaseKeys } from './ui/hooks/purchase-keys';
export { PurchasesScreen } from './ui/screens/PurchasesScreen';
export { NewPurchaseScreen } from './ui/screens/NewPurchaseScreen';
export { PurchaseLinesScreen } from './ui/screens/PurchaseLinesScreen';
export { PurchaseTotalsScreen } from './ui/screens/PurchaseTotalsScreen';
export { PurchaseAttachmentScreen } from './ui/screens/PurchaseAttachmentScreen';
export { PurchaseDetailScreen } from './ui/screens/PurchaseDetailScreen';
