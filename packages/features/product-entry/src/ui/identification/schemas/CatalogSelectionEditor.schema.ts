import { rules, s, type ValidationRules } from '@dukani/forms';
import { SELECTION_NOTE_MAX, SELECTION_TITLE_MAX } from '../../../domain/entry-selection.constants';
import type { EntryTranslator } from '../../i18n/types';

/** The store's own name and private note of a chosen catalog item: both optional, with the server's limits. */
export const selectionSchema = (t: EntryTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    localTitle: validationRules.optionalText(t('displayName'), SELECTION_TITLE_MAX),
    localNote: validationRules.optionalText(t('privateNote'), SELECTION_NOTE_MAX),
  });
