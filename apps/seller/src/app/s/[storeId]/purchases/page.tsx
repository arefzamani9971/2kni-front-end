'use client';

import { Suspense } from 'react';
import { Purchases } from './purchases';

export default function PurchasesPage() {
  return (
    <Suspense>
      <Purchases />
    </Suspense>
  );
}
