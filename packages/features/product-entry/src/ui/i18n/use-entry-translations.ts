import { useCatalogTranslations } from '@dukani/i18n';
import { entryCatalogs } from './catalogs';
export function useEntryTranslations() {
  return useCatalogTranslations(entryCatalogs);
}
