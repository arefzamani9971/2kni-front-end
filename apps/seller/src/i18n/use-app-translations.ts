import { useCatalogTranslations } from '@dukani/i18n';
import { appCatalogs } from './catalogs';
export function useAppTranslations() {
  return useCatalogTranslations(appCatalogs);
}
