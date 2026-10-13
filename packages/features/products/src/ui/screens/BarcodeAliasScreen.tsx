'use client';
import { useActiveStore } from '@dukani/platform';
import { BarcodeAliasEditor } from './BarcodeAliasEditor';

/** Reset the editor when navigating between stores or products. */
export function BarcodeAliasScreen({ productId }: { productId: string }) {
  const store = useActiveStore();
  return <BarcodeAliasEditor key={store.id + ':' + productId} productId={productId} />;
}
