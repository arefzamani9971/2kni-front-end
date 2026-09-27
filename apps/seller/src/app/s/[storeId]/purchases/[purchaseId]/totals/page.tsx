'use client';
import { PurchaseTotalsScreen } from '@dukani/purchasing';
import { useParams } from 'next/navigation';

export default function PurchaseTotalsPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  return <PurchaseTotalsScreen key={purchaseId} purchaseId={purchaseId} />;
}
