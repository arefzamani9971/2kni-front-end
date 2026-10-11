'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EntryBarcodeScreen } from '@dukani/product-entry';
function Barcode() {
  const params = useSearchParams();
  return <EntryBarcodeScreen bulk={params.get('bulk') === '1'} />;
}
export default function EntryBarcodePage() {
  return (
    <Suspense>
      <Barcode />
    </Suspense>
  );
}
