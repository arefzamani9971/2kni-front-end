import { priceMethodValues } from '@dukani/contracts';
import type { EntryTranslator } from '../i18n/types';
import { moneyOps } from '@dukani/domain';
import { rules, s, type ValidationRules } from '@dukani/forms';

export const schema = (t: EntryTranslator, validationRules: ValidationRules = rules) =>
  s
    .object({
      method: s.enum(priceMethodValues),
      manualPrice: validationRules.optionalMoney(),
      markupPercent: s.string(),
      fixedProfit: validationRules.optionalMoney(),
      roundingStep: validationRules.optionalMoney(),
      lowStock: s.string(),
    })
    .superRefine((v, ctx) => {
      if (v.method === 'Manual' && (!v.manualPrice || moneyOps.isZero(v.manualPrice)))
        ctx.addIssue({ code: 'custom', path: ['manualPrice'], message: t('priceRequired') });
      if (v.method === 'Markup' && !/^\d+(\.\d{1,2})?$/.test(v.markupPercent))
        ctx.addIssue({ code: 'custom', path: ['markupPercent'], message: t('markupRequired') });
      if (v.method === 'FixedProfit' && !v.fixedProfit)
        ctx.addIssue({ code: 'custom', path: ['fixedProfit'], message: t('profitRequired') });
    });
