'use client';
import { EntryNewScreen } from '@dukani/product-entry';
import { useParams, useSearchParams } from 'next/navigation';

export default function EntryNewPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const purchaseHostId = useSearchParams().get('purchaseId') ?? undefined;
  return <EntryNewScreen key={`${storeId}:${purchaseHostId ?? ''}`} purchaseHostId={purchaseHostId} />;
}
