import type { StoreTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';

/** storeprofile «تماس و نشانی» (358:481): every field optional, but a filled value must be valid (F02 §6). */
export const contactSchema = (t: StoreTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    phone: validationRules.optional.storePhone(),
    email: validationRules.optional.email().refine((v) => v === null || v.length <= 160, t('emailLimit')),
    addressLine: validationRules.optionalText(t('address'), 400),
    postalCode: validationRules.optional.postalCode(),
  });
