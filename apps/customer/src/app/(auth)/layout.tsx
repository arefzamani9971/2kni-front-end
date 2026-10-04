'use client';
import { ShellNavProvider } from '@dukani/ui-kit';
import { Suspense, type ReactNode } from 'react';

/**
 * Login pages read `?next=` (useSearchParams) → client-rendered under Suspense.
 * Desktop shows Figma 20 «Sidebar / Auth branding» (566:21231): brand + «حساب مشتری», no menu before login.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <ShellNavProvider items={[]} workspace="حساب مشتری" sidebarFooter="فضای کاری دکانی">
      <Suspense>{children}</Suspense>
    </ShellNavProvider>
  );
}
