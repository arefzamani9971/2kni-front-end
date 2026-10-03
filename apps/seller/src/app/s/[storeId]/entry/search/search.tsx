'use client';
import { EntrySearchScreen } from '@dukani/product-entry';
import { useSearchParams } from 'next/navigation';

export function Search() {
  const q = useSearchParams().get('q') ?? '';
  return <EntrySearchScreen key={q} query={q} />;
}
