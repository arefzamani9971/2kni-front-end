import type { createCatalogTranslator } from '@dukani/i18n';
import type { productCatalogs } from './catalogs';
export type ProductTranslator = ReturnType<typeof createCatalogTranslator<typeof productCatalogs.fa>>;
