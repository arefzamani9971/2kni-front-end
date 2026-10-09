import type { createCatalogTranslator } from '@dukani/i18n';
import type { entryCatalogs } from './catalogs';
export type EntryTranslator = ReturnType<typeof createCatalogTranslator<typeof entryCatalogs.fa>>;
