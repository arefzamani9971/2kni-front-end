'use client';
import { EntrySearchScreen, EntryLookupScreen } from '@dukani/product-entry';
import { useSearchParams } from 'next/navigation';
export function Search() {
  const params = useSearchParams();
  const query = params.get('q') ?? '';
  const origin = params.get('origin');
  return origin === 'manual' || origin === 'camera' || origin === 'hardware' ? (
    <EntryLookupScreen key={query + origin} code={query} origin={origin} bulk={params.get('bulk') === '1'} />
  ) : (
    <EntrySearchScreen
      filters={{
        categoryId: params.get('categoryId') ?? undefined,
        productTypeId: params.get('productTypeId') ?? undefined,
        brandId: params.get('brandId') ?? undefined,
      }}
      bulk={params.get('bulk') === '1'}
      query={query}
      itemId={params.get('item') ?? undefined}
      productId={params.get('product') ?? undefined}
    />
  );
}
