'use client';
import { PurchasesScreen } from '@dukani/purchasing';
import { useSearchParams } from 'next/navigation';

export function Purchases() {
  const status = useSearchParams().get('status');
  return <PurchasesScreen initialFilter={status === 'Draft' ? 'Draft' : 'All'} />;
}
