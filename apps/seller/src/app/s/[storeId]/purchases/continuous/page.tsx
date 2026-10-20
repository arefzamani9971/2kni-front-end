'use client';

import { Suspense } from 'react';
import { ContinuousPurchase } from './continuous-purchase';

export default function ContinuousPurchasePage() {
  return (
    <Suspense>
      <ContinuousPurchase />
    </Suspense>
  );
}
