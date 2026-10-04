import { rules, s } from '@dukani/forms';

/** «مقدار خرید» line form (Figma 312:9194): unit, quantity, cost status/cost, optional dates. */
export const schemaFor = (maxDecimals: number) =>
  s
    .object({
      unitId: rules.required('واحد خرید'),
      quantity: rules.quantity(maxDecimals),
      costStatus: s.enum(['Known', 'Estimated', 'Unknown']),
      unitCost: rules.optionalMoney(),
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
    });
