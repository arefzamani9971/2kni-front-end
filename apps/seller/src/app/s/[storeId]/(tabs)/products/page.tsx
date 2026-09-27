'use client';
import { parseFilter, ProductsScreen, type ProductFilter } from '@dukani/products';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback } from 'react';

function Products() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filter = parseFilter({ q: params.get('q'), stock: params.get('stock'), cost: params.get('cost') });
  const onFilter = useCallback(
    (f: ProductFilter) => {
      const qs = new URLSearchParams();
      if (f.q) qs.set('q', f.q);
      if (f.stock !== 'Any') qs.set('stock', f.stock);
      if (f.cost !== 'Any') qs.set('cost', f.cost);
      router.replace(qs.size ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );
  return <ProductsScreen filter={filter} onFilter={onFilter} />;
}

/** Filters live in the query string (architecture §8) so home links open a filtered list. */
export default function ProductsPage() {
  return (
    <Suspense>
      <Products />
    </Suspense>
  );
}
