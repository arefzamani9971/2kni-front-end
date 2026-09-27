'use client';
import { PurchaseDetailScreen } from '@dukani/purchasing';
import { useParams } from 'next/navigation';

export default function PurchaseDetailPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  return <PurchaseDetailScreen key={purchaseId} purchaseId={purchaseId} />;
}
