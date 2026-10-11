'use client';
import { CorrectionDetailScreen } from '@dukani/catalog';
import { useParams } from 'next/navigation';

export default function CorrectionDetailPage() {
  const { correctionId } = useParams<{ correctionId: string }>();
  return <CorrectionDetailScreen key={correctionId} correctionId={correctionId} />;
}
