import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '../composition/providers';
import { iranSansX } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'دکانی — خریدهای من', template: '%s | دکانی' },
  description: 'خریدها، فاکتورها و بدهی‌های شما در فروشگاه‌ها',
  applicationName: 'دکانی',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#4F46E5', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="customer" className={iranSansX.variable}>
      <body className="bg-canvas font-sans text-fg-primary antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
