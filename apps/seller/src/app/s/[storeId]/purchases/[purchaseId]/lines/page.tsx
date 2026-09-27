'use client';
import { PurchaseLinesScreen } from '@dukani/purchasing';
import { useParams } from 'next/navigation';

export default function PurchaseLinesPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  return <PurchaseLinesScreen key={purchaseId} purchaseId={purchaseId} />;
}
