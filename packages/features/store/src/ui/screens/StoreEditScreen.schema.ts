import type { StoreTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';
import { contactSchema } from '../components/StoreContactStep.schema';

/** STORE-05 «ویرایش فروشگاه» (385:6912): name and type required; contact fields optional but valid (F03 §4). */
export const editSchema = (t: StoreTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    name: validationRules.requiredText(t('storeName'), 160),
    storeTypeId: validationRules.required(t('storeType')),
    businessMode: s.enum(['Retail', 'Wholesale', 'Both']).nullable(),
    phone: contactSchema(t, validationRules).shape.phone,
    email: contactSchema(t, validationRules).shape.email,
    addressLine: contactSchema(t, validationRules).shape.addressLine,
  });
