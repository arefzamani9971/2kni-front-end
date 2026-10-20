import type { EntryTranslator } from '../../i18n/types';

export const STANDALONE_RESULT_COLUMN_KEYS = [
  'storeProduct',
  'stockPrice',
] as const satisfies readonly Parameters<EntryTranslator>[0][];
