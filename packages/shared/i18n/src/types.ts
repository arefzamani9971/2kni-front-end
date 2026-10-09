import type { ReactNode } from 'react';
import type fa from './messages/fa.json';
export type Locale = 'fa' | 'en';
export type Messages = typeof fa;
export interface I18nProviderProps {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
