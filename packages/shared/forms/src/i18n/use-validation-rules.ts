import { useCatalogTranslations } from '@dukani/i18n';
import { createRules } from '../schema';
import { formCatalogs } from './catalogs';
export function useValidationRules() {
  return createRules(useCatalogTranslations(formCatalogs));
}
