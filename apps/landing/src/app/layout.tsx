import { createCatalogTranslator } from '@dukani/i18n';
import { appCatalogs } from '../i18n/catalogs';
import { DEFAULT_LOCALE, getDirection } from '@dukani/i18n';
import { AppI18nProvider } from '@dukani/i18n/server';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { iranSansX } from './fonts';
import './globals.css';

const metadataText = createCatalogTranslator(DEFAULT_LOCALE, appCatalogs);

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://2kni.ir'),
  title: metadataText('landingTitle'),
  description: metadataText('landingDescription'),
  applicationName: metadataText('brand'),
  openGraph: {
    title: metadataText('brand'),
    description: metadataText('landingTagline'),
    locale: 'fa_IR',
    type: 'website',
  },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { themeColor: '#0F766E', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={getDirection(DEFAULT_LOCALE)}
      data-theme="shop"
      className={iranSansX.variable}
    >
      <body className="bg-surface text-fg-primary font-sans antialiased">
        <AppI18nProvider>{children}</AppI18nProvider>
      </body>
    </html>
  );
}
