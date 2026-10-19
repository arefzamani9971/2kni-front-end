/** Product entry feature (scope:seller): F07–F16 wizard from search/barcode/catalog/new item to register. */
export { createProductEntryModule, ProductEntryModuleProvider, useProductEntryModule } from './module';
export { type ProductEntryModule } from './module.types';
export type { EntryCatalog, EntryCommands, EntryDrafts } from './application/ports';
export { stepsOf, toRegisterRequest } from './domain/entry-draft';
export { type EntryDraft, type EntryStep } from './domain/entry-draft.types';
export { EntryMethodScreen } from './ui/identification/screens/EntryMethodScreen';
export { EntryNewScreen } from './ui/identification/screens/EntryNewScreen';
export { CatalogAttachmentsScreen } from './ui/attachments/screens/CatalogAttachmentsScreen';
export { EntrySearchScreen } from './ui/identification/screens/EntrySearchScreen';
export { EntryBarcodeScreen } from './ui/identification/screens/EntryBarcodeScreen';
export { EntryDetailsScreen } from './ui/details/screens/EntryDetailsScreen';
export { EntryUnitsScreen } from './ui/units/screens/EntryUnitsScreen';
export { EntryStockScreen } from './ui/stock/screens/EntryStockScreen';
export { EntryPricingScreen } from './ui/pricing/screens/EntryPricingScreen';
export { EntryReviewScreen } from './ui/review/screens/EntryReviewScreen';
export { EntryDoneScreen } from './ui/review/screens/EntryDoneScreen';
export type { CatalogCreationSlots } from './ui/details/types/CatalogCreationSlots.types';

export { useStartEntry as useProductEntryActions } from './ui/common/hooks/use-start-entry';

export { EntryScanScreen } from './ui/identification/screens/EntryScanScreen';
export { EntryLookupScreen } from './ui/identification/screens/EntryLookupScreen';

export { EntryBulkScreen } from './ui/bulk/screens/EntryBulkScreen';
export { EntryServiceScreen } from './ui/identification/screens/EntryServiceScreen';
