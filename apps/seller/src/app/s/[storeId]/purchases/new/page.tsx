'use client';
import { NewPurchaseScreen } from '@dukani/purchasing';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function NewPurchase() {
  return <NewPurchaseScreen productId={useSearchParams().get('productId')} />;
}

export default function NewPurchasePage() {
  return (
    <Suspense>
      <NewPurchase />
    </Suspense>
  );
}
