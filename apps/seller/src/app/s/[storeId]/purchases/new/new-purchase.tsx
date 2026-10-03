'use client';
import { NewPurchaseScreen } from '@dukani/purchasing';
import { useSearchParams } from 'next/navigation';

export function NewPurchase() {
  return <NewPurchaseScreen productId={useSearchParams().get('productId')} />;
}
