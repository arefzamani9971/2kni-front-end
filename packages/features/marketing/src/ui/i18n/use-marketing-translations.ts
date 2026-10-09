import { useCatalogTranslations } from '@dukani/i18n';
import { marketingCatalogs } from './catalogs';
export function useMarketingTranslations() {
  return useCatalogTranslations(marketingCatalogs);
}
