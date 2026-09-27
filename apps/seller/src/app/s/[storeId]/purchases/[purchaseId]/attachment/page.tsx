'use client';
import { PurchaseAttachmentScreen } from '@dukani/purchasing';
import { useParams } from 'next/navigation';

export default function PurchaseAttachmentPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  return <PurchaseAttachmentScreen key={purchaseId} purchaseId={purchaseId} />;
}
