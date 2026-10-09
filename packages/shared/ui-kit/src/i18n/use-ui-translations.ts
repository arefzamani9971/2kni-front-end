import { useCatalogTranslations } from '@dukani/i18n';
import { uiCatalogs } from './catalogs';
export function useUiTranslations() {
  return useCatalogTranslations(uiCatalogs);
}
