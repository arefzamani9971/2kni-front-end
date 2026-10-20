import { priceMethodValues, roundingDirectionValues, type Dto } from '@dukani/contracts';
import type { EntryTranslator } from '../../i18n/types';
const METHOD_LABELS = {
  Manual: 'manualPrice',
  Markup: 'markup',
  FixedProfit: 'fixedProfit',
} as const satisfies Record<Dto<'PriceMethod'>, Parameters<EntryTranslator>[0]>;
export const createMethods = (t: EntryTranslator) =>
  priceMethodValues.map((value) => ({ value, label: t(METHOD_LABELS[value]) }));

export const createRoundingOptions = (t: EntryTranslator) =>
  roundingDirectionValues.map((value) => ({ value, label: t(`rounding.${value}`) }));
