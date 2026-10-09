import { createTranslator, type AbstractIntlMessages } from 'use-intl/core';
import type { Locale } from './types';
import { TIME_ZONE } from './config';

/** Pure translator for a catalog owned by its presentation module. Safe for request-scoped server use. */
export function createCatalogTranslator<M extends AbstractIntlMessages>(
  locale: Locale,
  catalogs: Record<Locale, M>,
) {
  return createTranslator({ locale, messages: catalogs[locale], timeZone: TIME_ZONE });
}
