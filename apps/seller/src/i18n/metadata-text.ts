import { createCatalogTranslator, DEFAULT_LOCALE } from '@dukani/i18n';
import { appCatalogs } from './catalogs';

/** Default-locale translator for the root layout's static metadata (read at build time, outside React). */
export const metadataText = createCatalogTranslator(DEFAULT_LOCALE, appCatalogs);
