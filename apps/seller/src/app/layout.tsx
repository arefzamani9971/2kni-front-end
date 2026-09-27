import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '../composition/providers';
import { iranSansX } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'دکانی — پنل فروشنده', template: '%s | دکانی' },
  description: 'ثبت کالا، خرید، فروش و بدهی فروشگاه',
  applicationName: 'دکانی',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#0F766E', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="shop" className={iranSansX.variable}>
      <body className="bg-canvas font-sans text-fg-primary antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
