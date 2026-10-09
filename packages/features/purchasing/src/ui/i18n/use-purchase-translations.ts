import { useCatalogTranslations } from '@dukani/i18n';
import { purchaseCatalogs } from './catalogs';
export function usePurchaseTranslations() {
  return useCatalogTranslations(purchaseCatalogs);
}
