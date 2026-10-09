import type { createCatalogTranslator } from '@dukani/i18n';
import type { appCatalogs } from './catalogs';
export type AppTranslator = ReturnType<typeof createCatalogTranslator<typeof appCatalogs.fa>>;
