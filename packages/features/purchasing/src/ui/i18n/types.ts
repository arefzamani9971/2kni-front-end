import type { createCatalogTranslator } from '@dukani/i18n';
import type { purchaseCatalogs } from './catalogs';
export type PurchaseTranslator = ReturnType<typeof createCatalogTranslator<typeof purchaseCatalogs.fa>>;
