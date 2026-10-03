'use client';

import { Suspense } from 'react';
import { Products } from './products';

/** Filters live in the query string (architecture §8) so home links open a filtered list. */
export default function ProductsPage() {
  return (
    <Suspense>
      <Products />
    </Suspense>
  );
}
