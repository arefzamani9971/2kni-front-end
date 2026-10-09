import type { createCatalogTranslator } from '@dukani/i18n';
import type { storeCatalogs } from './catalogs';
export type StoreTranslator = ReturnType<typeof createCatalogTranslator<typeof storeCatalogs.fa>>;
