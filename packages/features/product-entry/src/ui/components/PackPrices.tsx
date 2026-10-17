'use client';
import { decimal, moneyOps, type Money } from '@dukani/domain';
import { ListRow } from '@dukani/ui-kit';
import { entryUnitsOf } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { usePricePreview } from '../hooks/use-price-preview';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { PricingAppForm } from './PricingForm.types';

/** The computed price of each pack, following the price inputs. */
export function PackPrices({
  form,
  draft,
  cost,
}: {
  form: PricingAppForm;
  draft: EntryDraft;
  cost: Money | null;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const { preview } = usePricePreview(form, cost);
  if (!preview.final) return null;
  return entryUnitsOf(draft)
    .filter((u) => !decimal.eq(u.baseQty, decimal.of(1)))
    .map((u) => (
      <ListRow key={u.key}>
        {t('packPrice', {
          unit: u.name,
          amount: presentation.money(moneyOps.times(preview.final!, u.baseQty)),
        })}
      </ListRow>
    ));
}
