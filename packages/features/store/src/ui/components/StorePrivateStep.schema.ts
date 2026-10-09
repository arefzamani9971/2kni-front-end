import type { StoreTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';

/** storelegal «اطلاعات مالک و بانکی» (358:482): optional, validated when filled (F02 §7). */
export const privateSchema = (t: StoreTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    ownerName: validationRules.optionalText(t('ownerName'), 160),
    licenseNo: validationRules.optionalText(t('businessLicense'), 64),
    nationalId: validationRules.optional.nationalId(),
    accountNumber: validationRules.optional.accountNumber(),
    cardNumber: validationRules.optional.cardNumber(),
    iban: validationRules.optional.sheba(),
  });
