import { useCatalogTranslations } from '@dukani/i18n';
import { productCatalogs } from './catalogs';
export function useProductTranslations() {
  return useCatalogTranslations(productCatalogs);
}
