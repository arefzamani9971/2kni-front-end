import type { Dto } from '@dukani/contracts';
import type { EntryTranslator } from '../../i18n/types';

export const COST_STATUS_LABEL_KEYS = {
  Known: 'known',
  Estimated: 'estimated',
  Unknown: 'unknown',
} as const satisfies Record<Dto<'RegisterPreviewDto'>['costStatus'], Parameters<EntryTranslator>[0]>;
