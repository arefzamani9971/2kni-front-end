import { moneyOps } from '@dukani/domain';
import { rules, s } from '@dukani/forms';

export const schema = s
  .object({
    method: s.enum(['Manual', 'Markup', 'FixedProfit']),
    manualPrice: rules.optionalMoney(),
    markupPercent: s.string(),
    fixedProfit: rules.optionalMoney(),
    roundingStep: rules.optionalMoney(),
    lowStock: s.string(),
  })
  .superRefine((v, ctx) => {
    if (v.method === 'Manual' && (!v.manualPrice || moneyOps.isZero(v.manualPrice)))
      ctx.addIssue({ code: 'custom', path: ['manualPrice'], message: 'قیمت فروش را وارد کنید.' });
    if (v.method === 'Markup' && !/^\d+(\.\d{1,2})?$/.test(v.markupPercent))
      ctx.addIssue({ code: 'custom', path: ['markupPercent'], message: 'درصد افزوده را وارد کنید.' });
    if (v.method === 'FixedProfit' && !v.fixedProfit)
      ctx.addIssue({ code: 'custom', path: ['fixedProfit'], message: 'سود ثابت را وارد کنید.' });
  });
