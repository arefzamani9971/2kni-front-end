import { decimal, moneyOps, normalizeTitle } from '@dukani/domain';
import { rules, s, type ValidationRules } from '@dukani/forms';
import { UNIT_BASE_QTY_MAX, UNIT_NAME_MAX } from '../../domain/units.constants';
import type { ProductTranslator } from '../i18n/types';
import type { UnitFormContext } from './UnitForm.types';

/**
 * UNIT-01 unit form (F12 §5): a name not used by another active unit after normalization, a factor above zero and up
 * to 10⁹ with the base unit's decimals, one use at least, an optional price above zero and an optional barcode (F08).
 * Name and factor are fixed once the unit exists; an edit changes uses and price only.
 */
export const unitSchema = (
  t: ProductTranslator,
  ctx: UnitFormContext,
  validationRules: ValidationRules = rules,
) =>
  s
    .object({
      // field rules, so every field shows its error at once
      name: validationRules
        .requiredText(t('units.name'), UNIT_NAME_MAX)
        .refine((name) => ctx.mode === 'edit' || !ctx.takenNames.includes(normalizeTitle(name)), {
          message: t('units.nameDuplicate'),
        }),
      baseQty: validationRules
        .quantity(Math.min(3, Math.max(ctx.maxDecimals, 0)))
        .refine((qty) => !decimal.gt(qty, decimal.of(UNIT_BASE_QTY_MAX)), {
          message: t('units.baseQtyInvalid'),
        }),
      isPurchasable: s.boolean(),
      isSellable: s.boolean(),
      salePrice: validationRules.optionalMoney(),
      barcode: validationRules.optional.barcode(),
    })
    .superRefine((v, issue) => {
      if (!v.isPurchasable && !v.isSellable)
        issue.addIssue({ code: 'custom', path: ['isPurchasable'], message: t('units.usesRequired') });
      if (v.salePrice && moneyOps.isZero(v.salePrice))
        issue.addIssue({ code: 'custom', path: ['salePrice'], message: t('units.priceInvalid') });
    });
