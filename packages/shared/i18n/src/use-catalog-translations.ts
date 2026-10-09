import { useLocale } from 'next-intl';
import type { AbstractIntlMessages } from 'use-intl/core';
import { createCatalogTranslator } from './catalog-translator';
import type { Locale } from './types';

/** Catalog ownership stays in UI; this adapter only supplies the request/provider locale. */
export function useCatalogTranslations<M extends AbstractIntlMessages>(catalogs: Record<Locale, M>) {
  return createCatalogTranslator(useLocale(), catalogs);
}
