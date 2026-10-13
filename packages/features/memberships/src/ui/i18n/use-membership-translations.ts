import { useCatalogTranslations } from '@dukani/i18n';
import { membershipCatalogs } from './catalogs';
export function useMembershipTranslations() {
  return useCatalogTranslations(membershipCatalogs);
}
