import { metadataText } from '../i18n/metadata-text';
import { DEFAULT_LOCALE, getDirection } from '@dukani/i18n';
import { AppI18nProvider } from '@dukani/i18n/server';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { ViewportScript } from '@dukani/ui-kit/viewport-script';
import { AppProviders } from '../composition/providers';
import { iranSansX } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: metadataText('customerTitle'), template: metadataText('titleTemplate') },
  description: metadataText('customerDescription'),
  applicationName: metadataText('brand'),
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      dir={getDirection(DEFAULT_LOCALE)}
      data-theme="customer"
      className={iranSansX.variable}
      suppressHydrationWarning
    >
      <head>
        <ViewportScript />
      </head>
      <body className="bg-canvas text-fg-primary font-sans antialiased">
        <AppI18nProvider>
          <AppProviders>{children}</AppProviders>
        </AppI18nProvider>
      </body>
    </html>
  );
}
