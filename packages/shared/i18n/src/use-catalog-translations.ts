import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import { createTranslator, type AbstractIntlMessages } from 'use-intl/core';
import { TIME_ZONE } from './config';
import type { Locale } from './types';

/** Catalog ownership stays in UI; this adapter only supplies the request/provider locale. */
export function useCatalogTranslations<M extends AbstractIntlMessages>(catalogs: Record<Locale, M>) {
  const locale = useLocale();
  const messages = catalogs[locale];

  // Callers may create a fresh catalog container; only the active catalog affects this translator.
  return useMemo(() => createTranslator({ locale, messages, timeZone: TIME_ZONE }), [locale, messages]);
}
