import type { createCatalogTranslator } from '@dukani/i18n';
import type { formCatalogs } from './catalogs';
export type FormTranslator = ReturnType<typeof createCatalogTranslator<typeof formCatalogs.fa>>;
