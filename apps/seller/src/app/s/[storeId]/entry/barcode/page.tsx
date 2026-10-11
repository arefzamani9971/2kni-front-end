'use client';
import { Suspense } from 'react';
import { Barcode } from './barcode';

export default function EntryBarcodePage() {
  return (
    <Suspense>
      <Barcode />
    </Suspense>
  );
}
