import type { createCatalogTranslator } from '@dukani/i18n';
import type { authCatalogs } from './catalogs';
export type AuthTranslator = ReturnType<typeof createCatalogTranslator<typeof authCatalogs.fa>>;
