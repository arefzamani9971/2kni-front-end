'use client';
import { moneyOps, type Money } from '@dukani/domain';
import { MoneyField } from '@dukani/ui-kit';
import type { EntryUnit } from '../../../domain/entry-draft.types';
import { usePricePreview } from '../hooks/use-price-preview';
import { useEntryPresentation } from '../../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { PricingAppForm } from '../types/PricingForm.types';

/**
 * «قیمت فروش هر بسته» (Figma units 312:808, F12 §10): an optional explicit price per sale package, which may differ
 * from its size × the single price. Left empty, the hint shows the price the package follows.
 */
export function PackPrices({
  form,
  packs,
  cost,
}: {
  form: PricingAppForm;
  packs: readonly EntryUnit[];
  cost: Money | null;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const { preview } = usePricePreview(form, cost);
  return packs.map((u, i) => (
    <form.Field key={u.key} name={`packPrices.${i}.price`}>
      {(f) => (
        <MoneyField
          {...f}
          label={t('packSalePrice', { unit: u.name })}
          optional
          hint={
            preview.final
              ? t('packSalePriceHint', {
                  amount: presentation.money(moneyOps.times(preview.final, u.baseQty)),
                  quantity: presentation.qty(u.baseQty),
                })
              : t('packSalePriceFollows')
          }
        />
      )}
    </form.Field>
  ));
}
