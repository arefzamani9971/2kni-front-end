'use client';
import type { Dto } from '@dukani/contracts';
import { useFieldValue } from '@dukani/forms';
import { MoneyField, Text } from '@dukani/ui-kit';
import { useProductTranslations } from '../i18n/use-product-translations';
import { useUnitPresentation } from '../i18n/use-unit-presentation';
import type { UnitAppForm } from './UnitForm.types';

/**
 * «قیمت فروش هر واحد» (F12 §10): optional and only for a sellable unit; it may differ from the factor × the single
 * price. Left empty the unit follows the single price; the hint names that price only when the server has given it
 * (an edited unit without its own price), never one computed here (F12 §7). Only this leaf follows the sale use.
 */
export function UnitPriceField({ form, unit }: { form: UnitAppForm; unit?: Dto<'StoreProductUnitDto'> }) {
  const t = useProductTranslations();
  const { price } = useUnitPresentation();
  const sellable = useFieldValue(form, 'isSellable');
  if (!sellable) return null;
  // the base unit is priced by the product's pricing rule (F16), not here
  if (unit?.isBase)
    return (
      <Text variant="body-s" tone="secondary">
        {t('units.basePrice')}
      </Text>
    );
  const derived = unit && unit.salePriceAmount == null ? price(unit.effectivePriceAmount) : null;
  return (
    <form.Field name="salePrice">
      {(f) => (
        <MoneyField
          {...f}
          label={t('units.salePrice')}
          optional
          hint={derived ? t('units.salePriceHint', { price: derived }) : t('units.salePriceFollows')}
        />
      )}
    </form.Field>
  );
}
