'use client';
import { IntlProvider } from 'use-intl';
import { TIME_ZONE } from './config';
import type { I18nProviderProps } from './types';
export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return (
    <IntlProvider locale={locale} messages={messages} timeZone={TIME_ZONE}>
      {children}
    </IntlProvider>
  );
}
