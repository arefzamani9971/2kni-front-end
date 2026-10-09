import type { EntryTranslator } from '../i18n/types';
import { todayDateOnly } from '@dukani/domain';
import { rules, s, type ValidationRules } from '@dukani/forms';

/** Stock step (opening stock / purchase): quantity in an entry unit, cost status, supplier, dates. */
export const schemaFor = (
  maxDecimals: number,
  t: EntryTranslator,
  validationRules: ValidationRules = rules,
) =>
  s
    .object({
      quantity: validationRules.quantity(maxDecimals),
      unitKey: validationRules.required(t('entryUnit')),
      costStatus: s.enum(['Known', 'Estimated', 'Unknown']),
      unitCost: validationRules.optionalMoney(),
      supplierId: s.string(),
      invoiceNo: validationRules.optionalText(t('invoiceNumber'), 40),
      productionDate: validationRules.optionalDate(),
      expiryDate: validationRules.optionalDate(),
    })
    .superRefine((v, ctx) => {
      if (v.costStatus !== 'Unknown' && !v.unitCost)
        ctx.addIssue({
          code: 'custom',
          path: ['unitCost'],
          message: t('costRequired'),
        });
      if (v.productionDate && v.expiryDate && v.productionDate > v.expiryDate)
        ctx.addIssue({
          code: 'custom',
          path: ['expiryDate'],
          message: t('dateOrder'),
        });
      if (v.productionDate && v.productionDate > todayDateOnly())
        ctx.addIssue({
          code: 'custom',
          path: ['productionDate'],
          message: t('productionFuture'),
        });
    });
