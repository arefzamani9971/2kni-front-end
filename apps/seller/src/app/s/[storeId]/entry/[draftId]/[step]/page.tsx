'use client';
import {
  EntryDetailsScreen,
  EntryDoneScreen,
  EntryPricingScreen,
  EntryReviewScreen,
  EntryStockScreen,
  EntryUnitsScreen,
} from '@dukani/product-entry';
import { notFound, useParams } from 'next/navigation';

const STEPS = {
  details: EntryDetailsScreen,
  units: EntryUnitsScreen,
  stock: EntryStockScreen,
  pricing: EntryPricingScreen,
  review: EntryReviewScreen,
  done: EntryDoneScreen,
} as const;

/** `~/entry/[draftId]/[step]`: the wizard draft lives in IndexedDB, so each step survives a refresh. */
export default function EntryStepPage() {
  const { draftId, step } = useParams<{ draftId: string; step: string }>();
  const Screen = STEPS[step as keyof typeof STEPS];
  if (!Screen) notFound();
  return <Screen key={draftId} draftId={draftId} />;
}
