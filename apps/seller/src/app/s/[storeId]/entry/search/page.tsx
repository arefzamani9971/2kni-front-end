'use client';
import { EntrySearchScreen } from '@dukani/product-entry';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function Search() {
  const q = useSearchParams().get('q') ?? '';
  return <EntrySearchScreen key={q} query={q} />;
}

export default function EntrySearchPage() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}
