import type { EntryTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';

export const schema = (t: EntryTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    title: validationRules.requiredText(t('fullName'), 250),
    productTypeId: validationRules.required(t('productType')),
    brand: validationRules.required(t('brand')),
    baseUnitId: validationRules.required(t('baseSalesUnit')),
    barcode: validationRules.optional.barcode(),
  });
