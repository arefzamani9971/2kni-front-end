'use client';
import { useAppTranslations } from '../../i18n/use-app-translations';

import { ShellNavProvider } from '@dukani/ui-kit';
import { Suspense, type ReactNode } from 'react';

/**
 * Login pages read `?next=` (useSearchParams) → client-rendered under Suspense.
 * Desktop shows Figma 20 «Sidebar / Auth branding» (566:21231): brand + «حساب مشتری», no menu before login.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const t = useAppTranslations();

  return (
    <ShellNavProvider items={[]} workspace={t('customerAccount')} sidebarFooter={t('workspace')}>
      <Suspense>{children}</Suspense>
    </ShellNavProvider>
  );
}
