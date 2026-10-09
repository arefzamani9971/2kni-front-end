import { getRequestConfig } from '@dukani/i18n/server';
import { DEFAULT_LOCALE, TIME_ZONE } from '@dukani/i18n';
import { loadMessages } from '@dukani/i18n/messages';

// Keep the current static routes and Persian production default during catalog migration.
export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  timeZone: TIME_ZONE,
  messages: await loadMessages(DEFAULT_LOCALE),
}));
