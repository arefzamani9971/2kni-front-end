'use client';
import { useSearchParams } from 'next/navigation';
import { EntryBarcodeScreen } from '@dukani/product-entry';

/** Reads `?bulk=1` (needs the page's Suspense boundary for useSearchParams). */
export function Barcode() {
  const params = useSearchParams();
  return <EntryBarcodeScreen bulk={params.get('bulk') === '1'} />;
}
