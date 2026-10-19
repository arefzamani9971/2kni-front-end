import type { EntryTranslator } from '../../i18n/types';
export const createCostLabels = (t: EntryTranslator) =>
  ({ Known: t('known'), Estimated: t('estimated'), Unknown: t('unknown') }) as const;
