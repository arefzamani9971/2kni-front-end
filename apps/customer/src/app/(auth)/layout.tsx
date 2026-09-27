import { Suspense, type ReactNode } from 'react';

/** Login pages read `?next=` (useSearchParams) → client-rendered under Suspense. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <Suspense>{children}</Suspense>;
}
