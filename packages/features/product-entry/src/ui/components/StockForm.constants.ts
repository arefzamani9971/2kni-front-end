import { costStatusValues, type Dto } from '@dukani/contracts';
import type { EntryTranslator } from '../i18n/types';
const COST_COPY = {
  Known: { label: 'known', description: 'invoiceBased' },
  Estimated: { label: 'estimated', description: 'correctableLater' },
  Unknown: { label: 'unknown', description: 'completeCostLater' },
} as const satisfies Record<
  Dto<'CostStatus'>,
  { label: Parameters<EntryTranslator>[0]; description: Parameters<EntryTranslator>[0] }
>;
export const createCostOptions = (t: EntryTranslator) =>
  costStatusValues.map((value) => ({
    value,
    label: t(COST_COPY[value].label),
    description: t(COST_COPY[value].description),
  }));
