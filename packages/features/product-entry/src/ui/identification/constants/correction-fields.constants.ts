import type { CorrectionDraft } from '../../../domain/correction-draft.types';
import type { EntryTranslator } from '../../i18n/types';

export const CORRECTION_FIELDS = [
  { value: 'title', labelKey: 'fullName' },
  { value: 'description', labelKey: 'correction.description' },
] as const satisfies readonly {
  readonly value: CorrectionDraft['field'];
  readonly labelKey: Parameters<EntryTranslator>[0];
}[];
