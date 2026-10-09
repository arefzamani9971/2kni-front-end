import { useCatalogTranslations } from '@dukani/i18n';
import { authCatalogs } from './catalogs';
export function useAuthTranslations() {
  return useCatalogTranslations(authCatalogs);
}
