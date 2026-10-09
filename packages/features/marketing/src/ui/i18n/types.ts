import type { createCatalogTranslator } from '@dukani/i18n';
import type { marketingCatalogs } from './catalogs';
export type MarketingTranslator = ReturnType<typeof createCatalogTranslator<typeof marketingCatalogs.fa>>;
