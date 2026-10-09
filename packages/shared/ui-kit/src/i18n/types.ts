import type { createCatalogTranslator } from '@dukani/i18n';
import type { uiCatalogs } from './catalogs';
export type UiTranslator = ReturnType<typeof createCatalogTranslator<typeof uiCatalogs.fa>>;
