import { todayDateOnly } from '@dukani/domain';
import { rules, s } from '@dukani/forms';

/** Stock step (opening stock / purchase): quantity in an entry unit, cost status, supplier, dates. */
export const schemaFor = (maxDecimals: number) =>
  s
    .object({
      quantity: rules.quantity(maxDecimals),
      unitKey: rules.required('واحد ورود'),
      costStatus: s.enum(['Known', 'Estimated', 'Unknown']),
      unitCost: rules.optionalMoney(),
      supplierId: s.string(),
      invoiceNo: rules.optionalText('شماره فاکتور', 40),
      productionDate: rules.optionalDate(),
      expiryDate: rules.optionalDate(),
    })
    .superRefine((v, ctx) => {
      if (v.costStatus !== 'Unknown' && !v.unitCost)
        ctx.addIssue({
          code: 'custom',
          path: ['unitCost'],
          message: 'بها را وارد کنید یا «نامعلوم» را انتخاب کنید.',
        });
      if (v.productionDate && v.expiryDate && v.productionDate > v.expiryDate)
        ctx.addIssue({
          code: 'custom',
          path: ['expiryDate'],
          message: 'تاریخ تولید نباید بعد از تاریخ انقضا باشد.',
        });
      if (v.productionDate && v.productionDate > todayDateOnly())
        ctx.addIssue({
          code: 'custom',
          path: ['productionDate'],
          message: 'تاریخ تولید نمی‌تواند در آینده باشد.',
        });
    });
