import type { useCatalogTexts } from './use-catalog-translations';

/** Translator of the catalog feature's own catalogs. */
export type CatalogTexts = ReturnType<typeof useCatalogTexts>;
