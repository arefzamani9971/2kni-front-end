import type { Locale, Messages } from './types';
/** Load only the requested catalog. No mutable process-wide locale on the server. */
export async function loadMessages(locale: Locale): Promise<Messages> {
  return locale === 'en'
    ? (await import('./messages/en.json')).default
    : (await import('./messages/fa.json')).default;
}
