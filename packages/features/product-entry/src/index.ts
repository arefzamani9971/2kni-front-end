/** Product entry feature (scope:seller): F07–F16 wizard from search/barcode/catalog/new item to register. */
export { createProductEntryModule, ProductEntryModuleProvider, useProductEntryModule } from './module';
export { type ProductEntryModule } from './module.types';
export type { EntryCatalog, EntryCommands, EntryDrafts } from './application/ports';
export { stepsOf, toRegisterRequest } from './domain/entry-draft';
export { type EntryDraft, type EntryStep } from './domain/entry-draft.types';
export { EntryMethodScreen } from './ui/screens/EntryMethodScreen';
export { EntryNewScreen } from './ui/screens/EntryNewScreen';
export { CatalogAttachmentsScreen } from './ui/screens/CatalogAttachmentsScreen';
export { EntrySearchScreen } from './ui/screens/EntrySearchScreen';
export { EntryBarcodeScreen } from './ui/screens/EntryBarcodeScreen';
export { EntryDetailsScreen } from './ui/screens/EntryDetailsScreen';
export { EntryUnitsScreen } from './ui/screens/EntryUnitsScreen';
export { EntryStockScreen } from './ui/screens/EntryStockScreen';
export { EntryPricingScreen } from './ui/screens/EntryPricingScreen';
export { EntryReviewScreen } from './ui/screens/EntryReviewScreen';
export { EntryDoneScreen } from './ui/screens/EntryDoneScreen';
export type { CatalogCreationSlots } from './ui/components/CatalogCreationSlots.types';

export { useStartEntry as useProductEntryActions } from './ui/hooks/use-start-entry';

export { EntryScanScreen } from './ui/screens/EntryScanScreen';
export { EntryLookupScreen } from './ui/screens/EntryLookupScreen';

export { EntryBulkScreen } from './ui/screens/EntryBulkScreen';
export { EntryServiceScreen } from './ui/screens/EntryServiceScreen';
