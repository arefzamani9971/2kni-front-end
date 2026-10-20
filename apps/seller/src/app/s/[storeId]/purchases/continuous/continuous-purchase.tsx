'use client';
import { ContinuousPurchaseScreen } from '@dukani/purchasing';
import { useSearchParams } from 'next/navigation';

export function ContinuousPurchase() {
  return <ContinuousPurchaseScreen productId={useSearchParams().get('productId')} />;
}
