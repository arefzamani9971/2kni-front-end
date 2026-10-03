'use client';

import { notFound, useParams } from 'next/navigation';
import { STEPS } from './page.constants';

/** `~/entry/[draftId]/[step]`: the wizard draft lives in IndexedDB, so each step survives a refresh. */
export default function EntryStepPage() {
  const { draftId, step } = useParams<{ draftId: string; step: string }>();
  const Screen = STEPS[step as keyof typeof STEPS];
  if (!Screen) notFound();
  return <Screen key={draftId} draftId={draftId} />;
}
