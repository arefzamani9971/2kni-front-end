/** Purchasing feature (scope:seller): receipts from draft to finalize, suppliers, attachments (F17–F21, F71); single-product receipts — continuous purchase and grouped opening stock (F13). */
export { createPurchasingModule, PurchasingModuleProvider, usePurchasingModule } from './module';
export { type PurchasingModule } from './module.types';
export type {
  FileUploader,
  ProductLookup,
  PurchaseRepository,
  SupplierRepository,
} from './application/ports';
export { purchaseKeys } from './ui/common/state/purchase-keys';
export { PurchasesScreen } from './ui/screens/PurchasesScreen';
export { NewPurchaseScreen } from './ui/screens/NewPurchaseScreen';
export { PurchaseLinesScreen } from './ui/screens/PurchaseLinesScreen';
export { PurchaseTotalsScreen } from './ui/screens/PurchaseTotalsScreen';
export { PurchaseAttachmentScreen } from './ui/screens/PurchaseAttachmentScreen';
export { PurchaseDetailScreen } from './ui/screens/PurchaseDetailScreen';
export { ContinuousPurchaseScreen } from './ui/quick-receipt/screens/ContinuousPurchaseScreen';
export { OpeningPickScreen } from './ui/quick-receipt/screens/OpeningPickScreen';
export { OpeningQueueScreen } from './ui/quick-receipt/screens/OpeningQueueScreen';
