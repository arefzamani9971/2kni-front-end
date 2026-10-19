import { priceMethodValues, roundingDirectionValues } from '@dukani/contracts';
import type { EntryTranslator } from '../../i18n/types';
import { moneyOps, decimal } from '@dukani/domain';
import { rules, s, type ValidationRules } from '@dukani/forms';

export const schema = (t: EntryTranslator, validationRules: ValidationRules = rules) =>
  s
    .object({
      method: s.enum(priceMethodValues),
      manualPrice: validationRules.optionalMoney(),
      markupPercent: s.string(),
      fixedProfit: validationRules.optionalMoney(),
      roundingStep: validationRules.optionalMoney(),
      roundingDirection: s.enum(roundingDirectionValues).default('Nearest'),
      lowStock: s.string(),
      // F12 §10: an explicit package price is optional; empty follows the single price
      packPrices: s.array(s.object({ unitKey: s.string(), price: validationRules.optionalMoney() })),
    })
    .superRefine((v, ctx) => {
      if (v.method === 'Manual' && (!v.manualPrice || moneyOps.isZero(v.manualPrice)))
        ctx.addIssue({ code: 'custom', path: ['manualPrice'], message: t('priceRequired') });
      if (v.method === 'Markup' && !/^\d+(\.\d{1,2})?$/.test(v.markupPercent))
        ctx.addIssue({ code: 'custom', path: ['markupPercent'], message: t('markupRequired') });
      else if (v.method === 'Markup' && decimal.gt(decimal.of(v.markupPercent), decimal.of(1000)))
        ctx.addIssue({ code: 'custom', path: ['markupPercent'], message: t('markupRange') });
      if (v.method === 'FixedProfit' && !v.fixedProfit)
        ctx.addIssue({ code: 'custom', path: ['fixedProfit'], message: t('profitRequired') });
      v.packPrices.forEach((pack, i) => {
        if (pack.price && moneyOps.isZero(pack.price))
          ctx.addIssue({
            code: 'custom',
            path: ['packPrices', i, 'price'],
            message: t('packSalePriceInvalid'),
          });
      });
    });
