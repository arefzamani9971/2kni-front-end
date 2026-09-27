'use client';
import { PurchasesScreen } from '@dukani/purchasing';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Purchases() {
  const status = useSearchParams().get('status');
  return <PurchasesScreen initialFilter={status === 'Draft' ? 'Draft' : 'All'} />;
}

export default function PurchasesPage() {
  return (
    <Suspense>
      <Purchases />
    </Suspense>
  );
}
