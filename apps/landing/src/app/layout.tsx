import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { iranSansX } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://2kni.ir'),
  title: 'دکانی — فروشگاهت، ساده‌تر و هوشمندتر',
  description: 'ثبت سریع کالا، فروش، موجودی، نسیه و سفارش برای فروشگاه‌های ایرانی؛ مشتری هم همه خریدهایش را یک‌جا می‌بیند.',
  applicationName: 'دکانی',
  openGraph: { title: 'دکانی', description: 'فروشگاهت، ساده‌تر و هوشمندتر', locale: 'fa_IR', type: 'website' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = { themeColor: '#0F766E', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" data-theme="shop" className={iranSansX.variable}>
      <body className="bg-surface font-sans text-fg-primary antialiased">{children}</body>
    </html>
  );
}
