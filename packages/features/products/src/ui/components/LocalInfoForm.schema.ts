import { rules, s, type ValidationRules } from '@dukani/forms';
import { LOCAL_NOTE_MAX, LOCAL_TITLE_MAX } from '../../domain/local-info';
import type { ProductTranslator } from '../i18n/types';

/** PRD-LOCAL-EDIT (312:9574): both texts optional with the server's limits; an empty cost means unknown. */
export const localInfoSchema = (t: ProductTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    localTitle: validationRules.optionalText(t('local.localTitle'), LOCAL_TITLE_MAX),
    localNote: validationRules.optionalText(t('local.localNote'), LOCAL_NOTE_MAX),
    changeServiceCost: s.boolean(),
    serviceCost: validationRules.optionalMoney(),
  });
