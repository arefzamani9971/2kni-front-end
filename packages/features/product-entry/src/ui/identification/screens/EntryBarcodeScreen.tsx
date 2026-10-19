'use client';
import { EntryScanScreen } from './EntryScanScreen';
export function EntryBarcodeScreen({ bulk = false }: { bulk?: boolean }) {
  return <EntryScanScreen initialManual bulk={bulk} />;
}
