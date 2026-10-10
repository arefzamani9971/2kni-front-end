'use client';
import { useSearchParams } from 'next/navigation';
import { CategoriesScreen } from '@dukani/catalog';
export default function Page() {
  const params = useSearchParams();
  return <CategoriesScreen initialQuery={params.get('q') ?? ''} />;
}
