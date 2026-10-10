import { useCatalogTranslations } from '@dukani/i18n';
import { catalogCatalogs } from './catalogs';
export const useCatalogTexts = () => useCatalogTranslations(catalogCatalogs);
