'use client';
import { EntryNewScreen } from '@dukani/product-entry';
import { useParams, useSearchParams } from 'next/navigation';

export default function EntryNewPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const params = useSearchParams();
  const purchaseHostId = params.get('purchaseId') ?? undefined;
  const continuousHost = params.get('host') === 'continuous';
  const barcode = params.get('barcode') ?? undefined;
  return (
    <EntryNewScreen
      key={`${storeId}:${purchaseHostId ?? ''}:${continuousHost}:${barcode ?? ''}`}
      purchaseHostId={purchaseHostId}
      continuousHost={continuousHost}
      barcode={barcode}
    />
  );
}
