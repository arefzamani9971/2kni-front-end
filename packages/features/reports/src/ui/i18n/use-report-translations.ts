import { useCatalogTranslations } from '@dukani/i18n';
import { reportCatalogs } from './catalogs';
export function useReportTranslations() {
  return useCatalogTranslations(reportCatalogs);
}
