import { rules, s, type ValidationRules } from '@dukani/forms';
import type { PurchaseTranslator } from '../../i18n/types';

/** suppliernew (594:6694 / 597:4130) on `UpsertSupplierRequest`: name 1–160, phone digits ≤20, note ≤500. */
export const supplierCreateSchemaFor = (t: PurchaseTranslator, validationRules: ValidationRules = rules) =>
  s.object({
    name: validationRules.requiredText(t('supplierCreate.name'), 160),
    phone: validationRules.optionalText(t('supplierCreate.phone'), 20),
    note: validationRules.optionalText(t('supplierCreate.note'), 500),
  });
