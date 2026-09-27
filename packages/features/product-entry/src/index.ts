/** Product entry feature (scope:seller): F07–F16 wizard from search/barcode/catalog/new item to register. */
export { createProductEntryModule, ProductEntryModuleProvider, useProductEntryModule, type ProductEntryModule } from './module';
export type { EntryCatalog, EntryCommands, EntryDrafts } from './application/ports';
export { stepsOf, toRegisterRequest, type EntryDraft, type EntryStep } from './domain/entry-draft';
export { EntryMethodScreen } from './ui/screens/EntryMethodScreen';
export { EntrySearchScreen } from './ui/screens/EntrySearchScreen';
export { EntryBarcodeScreen } from './ui/screens/EntryBarcodeScreen';
export { EntryDetailsScreen } from './ui/screens/EntryDetailsScreen';
export { EntryUnitsScreen } from './ui/screens/EntryUnitsScreen';
export { EntryStockScreen } from './ui/screens/EntryStockScreen';
export { EntryPricingScreen } from './ui/screens/EntryPricingScreen';
export { EntryReviewScreen } from './ui/screens/EntryReviewScreen';
export { EntryDoneScreen } from './ui/screens/EntryDoneScreen';
