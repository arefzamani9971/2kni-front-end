'use client';
import { useState } from 'react';
import type { Dto } from '@dukani/contracts';
import { useBrands } from './use-brands';

/** Visible brands plus brands created in place, until the brand query catches up with them. */
export function useBrandChoices() {
  const brands = useBrands();
  const [created, setCreated] = useState<Dto<'BrandDto'>[]>([]);
  const available = [
    ...(brands.data ?? []),
    ...created.filter((b) => !brands.data?.some((existing) => existing.id === b.id)),
  ];
  return {
    query: brands,
    available,
    addCreated: (brand: { id: string; name: string }) =>
      setCreated((rows) => [...rows, { ...brand, nameEn: null, status: 'Private' }]),
  };
}
