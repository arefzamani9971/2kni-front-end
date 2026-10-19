'use client';
import type { Dto } from '@dukani/contracts';
import { decimal } from '@dukani/domain';
import { useFieldValue } from '@dukani/forms';
import { ListRow, Section } from '@dukani/ui-kit';
import { lineSummary } from '../../domain/purchase';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import type { LineAppForm } from './LineEditor.types';

const valid = (x: string | null | undefined) => !!x && /^\d+(\.\d+)?$/.test(x);

/**
 * «خلاصهٔ ورود» (Figma 312:9194, F12 §6): quantity × the chosen unit's factor in base units, the line total and the
 * cost per base unit. Only this leaf follows the typed quantity and cost, so typing never re-renders the form.
 */
export function LineSummary({
  form,
  unit,
  baseUnitName,
}: {
  form: LineAppForm;
  unit: Dto<'StoreProductUnitDto'> | undefined;
  baseUnitName: string;
}) {
  const t = usePurchaseTranslations();
  const presentation = usePurchasePresentation();
  const quantity = useFieldValue(form, 'quantity');
  const cost = useFieldValue(form, 'unitCost');
  const costStatus = useFieldValue(form, 'costStatus');
  if (!unit || !valid(quantity)) return null;
  const summary = lineSummary({
    quantity: decimal.of(quantity),
    baseQtyPerUnit: decimal.of(unit.baseQty),
    unitName: unit.name,
    baseUnitName,
    costStatus,
    unitCost: valid(cost) ? { amount: decimal.of(cost) } : null,
  });
  return (
    <Section title={t('entrySummary')} description={t('factorHistory')}>
      <ListRow>{presentation.digits(summary.conversion)}</ListRow>
      {summary.total ? (
        <ListRow>{t('totalCostLine', { amount: presentation.money(summary.total) })}</ListRow>
      ) : null}
      {summary.perBase ? (
        <ListRow>
          {t('perBaseLine', { unit: baseUnitName, amount: presentation.money(summary.perBase) })}
        </ListRow>
      ) : null}
    </Section>
  );
}
