import { useCatalogTranslations } from '@dukani/i18n';
import { storeCatalogs } from './catalogs';
export function useStoreTranslations() {
  return useCatalogTranslations(storeCatalogs);
}
