import type { EntryTranslator } from '../i18n/types';
import type { PriceMethod } from '../../domain/entry-draft.types';

export const createMethods = (t: EntryTranslator): { value: PriceMethod; label: string }[] => [
  { value: 'Manual', label: t('manualPrice') },
  { value: 'Markup', label: t('markup') },
  { value: 'FixedProfit', label: t('fixedProfit') },
];
