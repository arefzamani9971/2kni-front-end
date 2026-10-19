import { decimal, parseQuantity } from '@dukani/domain';
import { baseUnitNameOf, entryUnitsOf, maxDecimalsOf } from '../../../domain/entry-draft';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import type { EntryTranslator } from '../../i18n/types';

/** Presentation preview uses the same parser as submission; invalid text never becomes a different amount. */
export function stockConversion(
  draft: EntryDraft,
  raw: string,
  unitKey: string,
  t: EntryTranslator,
  format: (value: string) => string,
): string | null {
  const quantity = parseQuantity(raw, maxDecimalsOf(draft));
  const unit = entryUnitsOf(draft).find((candidate) => candidate.key === unitKey);
  if (!quantity.ok || !unit) return null;
  const total = decimal.mul(quantity.value, unit.baseQty);
  const base = baseUnitNameOf(draft);
  return decimal.eq(unit.baseQty, decimal.of(1))
    ? t('stockQuantity', { quantity: format(total), base })
    : t('stockConversion', {
        quantity: format(quantity.value),
        unit: unit.name,
        factor: format(unit.baseQty),
        total: format(total),
        base,
      });
}
