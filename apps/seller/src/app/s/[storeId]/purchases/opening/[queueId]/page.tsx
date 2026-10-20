'use client';
import { OpeningQueueScreen } from '@dukani/purchasing';
import { useParams } from 'next/navigation';

export default function OpeningQueuePage() {
  const { storeId, queueId } = useParams<{ storeId: string; queueId: string }>();
  return <OpeningQueueScreen key={`${storeId}:${queueId}`} queueId={queueId} />;
}
