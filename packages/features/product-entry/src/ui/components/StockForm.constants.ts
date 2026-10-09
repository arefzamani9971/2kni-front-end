import type { EntryTranslator } from '../i18n/types';
import type { Dto } from '@dukani/contracts';

export const createCostOptions = (
  t: EntryTranslator,
): { value: Dto<'CostStatus'>; label: string; description: string }[] => [
  { value: 'Known', label: t('known'), description: t('invoiceBased') },
  { value: 'Estimated', label: t('estimated'), description: t('correctableLater') },
  { value: 'Unknown', label: t('unknown'), description: t('completeCostLater') },
];
