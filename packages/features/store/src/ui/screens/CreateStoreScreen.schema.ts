import type { StoreTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';

/** setup (312:8744): name and type are required, business mode is an explicit choice (F02 §5). */
export const schema = (t: StoreTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    name: validationRules.requiredText(t('storeName'), 160),
    storeTypeId: validationRules.required(t('storeType')),
    businessMode: s.enum(['Retail', 'Wholesale', 'Both']),
  });
