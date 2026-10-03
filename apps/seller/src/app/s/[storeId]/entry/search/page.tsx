'use client';

import { Suspense } from 'react';
import { Search } from './search';

export default function EntrySearchPage() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}
