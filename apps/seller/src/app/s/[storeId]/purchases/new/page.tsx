'use client';

import { Suspense } from 'react';
import { NewPurchase } from './new-purchase';

export default function NewPurchasePage() {
  return (
    <Suspense>
      <NewPurchase />
    </Suspense>
  );
}
