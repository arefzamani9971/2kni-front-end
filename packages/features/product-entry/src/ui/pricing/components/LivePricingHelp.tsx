'use client';
import type { Money } from '@dukani/domain';
import { usePricePreview } from '../hooks/use-price-preview';
import { PricingHelp } from './PricingHelp';
import type { PricingAppForm } from '../types/PricingForm.types';

/** `PricingHelp` for the price being typed. */
export function LivePricingHelp({ form, cost }: { form: PricingAppForm; cost: Money | null }) {
  const { rule, preview } = usePricePreview(form, cost);
  return <PricingHelp cost={cost} rule={rule} preview={preview} />;
}
