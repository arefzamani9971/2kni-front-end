import type { EntryTranslator } from '../i18n/types';
import { rules, s, type ValidationRules } from '@dukani/forms';

export const schema = (t: EntryTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    title: validationRules.requiredText(t('fullName'), 250),
    productTypeId: validationRules.required(t('productType')),
    brand: validationRules.required(t('brand')),
    baseUnitId: validationRules.required(t('baseSalesUnit')),
    barcode: validationRules.optional.barcode(),
    description: s.string().max(2000),
    localTitle: s.string().max(250),
    localNote: s.string().max(1000),
    shortcut: s
      .string()
      .trim()
      .refine((v) => !v || /^[\p{L}\p{N}_-]{1,16}$/u.test(v), t('shortcutInvalid')),
    serviceCost: validationRules.optionalMoney(),
    netContentValue: s.string().default(''),
    netContentUnitId: s.string().default(''),
  });
