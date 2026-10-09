import type { StoreTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';

/** storelocation (594:6736): the typed address is optional; the point is validated by LocationField. */
export const schema = (t: StoreTranslator, validationRules: ValidationRules = rules) =>
  s.object({ addressLine: validationRules.optionalText(t('address'), 400) });
