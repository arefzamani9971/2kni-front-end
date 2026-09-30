import type { Dto } from '@dukani/contracts';

/**
 * The mock keeps plain JS numbers internally (it is a simulation), while the API sends every decimal — money and
 * quantities — as a string (BCR-01). These helpers are the only conversion points.
 */
export const num = (v: string | number | null | undefined): number | null =>
  v === null || v === undefined || v === '' ? null : Number(v);

export const num0 = (v: string | number | null | undefined): number => num(v) ?? 0;

/** Number → API decimal string; float noise from mock arithmetic is trimmed (0.1 + 0.2 → "0.3"). */
export function str(v: number): string;
export function str(v: number | null | undefined): string | null;
export function str(v: number | null | undefined): string | null {
  return v === null || v === undefined ? null : String(Number(v.toFixed(6)));
}

/** Price rule with numeric amounts (internal form of `PriceRuleDto`). */
export type MockPriceRule = Omit<Dto<'PriceRuleDto'>, 'manualPriceAmount' | 'markupPercent' | 'fixedProfitAmount' | 'roundingStepAmount'> & {
  manualPriceAmount: number | null;
  markupPercent: number | null;
  fixedProfitAmount: number | null;
  roundingStepAmount: number | null;
};

export const fromRuleDto = (r: Dto<'PriceRuleDto'>): MockPriceRule => ({
  ...r,
  manualPriceAmount: num(r.manualPriceAmount),
  markupPercent: num(r.markupPercent),
  fixedProfitAmount: num(r.fixedProfitAmount),
  roundingStepAmount: num(r.roundingStepAmount),
});

export const toRuleDto = (r: MockPriceRule): Dto<'PriceRuleDto'> => ({
  ...r,
  manualPriceAmount: str(r.manualPriceAmount),
  markupPercent: str(r.markupPercent),
  fixedProfitAmount: str(r.fixedProfitAmount),
  roundingStepAmount: str(r.roundingStepAmount),
});
