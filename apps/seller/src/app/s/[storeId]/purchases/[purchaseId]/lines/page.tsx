'use client';
import { PurchaseLinesScreen } from '@dukani/purchasing';
import { useParams, useSearchParams } from 'next/navigation';

export default function PurchaseLinesPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const productId = useSearchParams().get('productId') ?? undefined;
  return (
    <PurchaseLinesScreen
      key={`${purchaseId}:${productId ?? ''}`}
      purchaseId={purchaseId}
      productId={productId}
    />
  );
}
