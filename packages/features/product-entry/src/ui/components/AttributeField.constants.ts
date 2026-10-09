import type { EntryTranslator } from '../i18n/types';
const BOOLEAN_LABELS = { true: 'yes', false: 'no' } as const;
export const createBooleanOptions = (t: EntryTranslator) =>
  Object.entries(BOOLEAN_LABELS).map(([value, key]) => ({ value, label: t(key) }));
