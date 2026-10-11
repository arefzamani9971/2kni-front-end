'use client';
import { useValidationRules } from '@dukani/forms';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { decimal, todayDateOnly, type DateOnly } from '@dukani/domain';

import {
  Alert,
  Button,
  DateField,
  DecimalField,
  ListRow,
  MoneyField,
  Section,
  SelectField,
  TextField,
} from '@dukani/ui-kit';
import { useState } from 'react';
import { baseUnitNameOf, entryUnitsOf, maxDecimalsOf, nextStep } from '../../domain/entry-draft';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useSuppliers } from '../hooks/use-suppliers';
import { useEntryNav } from '../hooks/use-entry-nav';
import type { Kind, Save } from './StockForm.types';
import { createCostOptions } from './StockForm.constants';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { schemaFor } from './StockForm.schema';

export function StockForm({
  draft,
  kind,
  save,
  onChangeOrigin,
}: {
  draft: EntryDraft;
  kind: Kind;
  save: Save;
  onChangeOrigin: () => void;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();

  const go = useEntryNav();
  const suppliers = useSuppliers();
  const units = entryUnitsOf(draft);
  const base = baseUnitNameOf(draft);
  const s0 = draft.stock?.kind === kind ? draft.stock : null;
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schemaFor(maxDecimalsOf(draft), t, validationRules),
    defaultValues: {
      quantity: s0?.quantity ?? '',
      unitKey:
        s0?.unitKey ??
        units.find(
          (u) =>
            draft.scanContext &&
            (u.storeProductUnitId === draft.scanContext.storeProductUnitId ||
              u.catalogItemUnitId === draft.scanContext.catalogItemUnitId),
        )?.key ??
        units[0]?.key ??
        'base',
      costStatus: s0?.costStatus ?? 'Known',
      unitCost: s0?.unitCost?.amount ?? '',
      supplierId: s0?.supplierId ?? '',
      invoiceNo: s0?.supplierInvoiceNo ?? '',
      productionDate: s0?.productionDate ?? '',
      expiryDate: s0?.expiryDate ?? '',
    },
  });
  const [details, setDetails] = useState(!!(s0?.productionDate || s0?.expiryDate));
  const cost = form.watch('costStatus');
  const unitKey = form.watch('unitKey');
  const unit = units.find((u) => u.key === unitKey) ?? units[0];
  const quantity = form.watch('quantity');
  const preview = presentation.stockConversion(draft, quantity, unitKey);

  const submit = form.handleSubmit(async (v) => {
    const supplier = suppliers.data?.find((x) => x.id === v.supplierId);
    const d = await save((x) => ({
      ...x,
      stockDecided: true,
      stock: {
        kind,
        unitKey: v.unitKey,
        quantity: v.quantity,
        costStatus: v.costStatus,
        unitCost: v.costStatus === 'Unknown' ? null : v.unitCost,
        supplierId: kind === 'Purchase' ? (supplier?.id ?? null) : null,
        supplierName: kind === 'Purchase' ? (supplier?.name ?? null) : null,
        supplierInvoiceNo: kind === 'Purchase' ? (v.invoiceNo ?? '') : '',
        productionDate: (v.productionDate as DateOnly | null) ?? null,
        expiryDate: (v.expiryDate as DateOnly | null) ?? null,
      },
    }));
    if (d) go.step(d.id, nextStep(d, 'stock'));
  });

  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        title={kind === 'Opening' ? t('openingStock') : t('newPurchase')}
        actions={
          <>
            <Button type="submit" block>
              {cost === 'Unknown'
                ? t('continueUnknown')
                : cost === 'Estimated'
                  ? t('recordEstimated')
                  : t('recordKnown')}
            </Button>
            <BackButton onClick={onChangeOrigin} label={t('changeOrigin')} />
          </>
        }
      >
        <Section title={kind === 'Opening' ? t('storeQuantity') : t('purchaseQuantity')}>
          <form.Field name="quantity">
            {(f) => (
              <DecimalField
                {...f}
                label={t('quantity')}
                required
                maxDecimals={maxDecimalsOf(draft)}
                unit={unit?.name}
              />
            )}
          </form.Field>
          <form.Field name="unitKey">
            {(f) => (
              <SelectField
                {...f}
                label={t('catalogUnit')}
                required
                options={units.map((u) => ({
                  value: u.key,
                  label: u.name,
                  description: decimal.eq(u.baseQty, decimal.of(1))
                    ? t('baseUnit')
                    : `${presentation.qty(u.baseQty)} ${base}`,
                }))}
              />
            )}
          </form.Field>
          {preview ? <ListRow>{preview}</ListRow> : null}
          <form.Field name="costStatus">
            {(f) => <SelectField {...f} label={t('costStatus')} required options={createCostOptions(t)} />}
          </form.Field>
          {cost !== 'Unknown' ? (
            <form.Field name="unitCost">
              {(f) => <MoneyField {...f} label={t('costOf', { unit: unit?.name ?? base })} required />}
            </form.Field>
          ) : null}
        </Section>
        {cost === 'Unknown' ? (
          <Alert tone="warning" title={t('costLater')} description={t('unknownProfitHint')} />
        ) : null}
        {kind === 'Purchase' ? (
          <Section title={t('purchaseInvoice')}>
            <form.Field name="supplierId">
              {(f) => (
                <SelectField
                  {...f}
                  label={t('supplier')}
                  optional
                  searchable
                  placeholder={t('chooseSupplier')}
                  options={(suppliers.data ?? []).map((x) => ({
                    value: x.id,
                    label: x.name,
                    description: x.phone ?? undefined,
                  }))}
                />
              )}
            </form.Field>
            <form.Field name="invoiceNo">
              {(f) => <TextField {...f} label={t('supplierInvoice')} optional maxLength={40} dir="auto" />}
            </form.Field>
          </Section>
        ) : null}
        {details ? (
          <Section title={t('productionExpiry')}>
            <form.Field name="productionDate">
              {(f) => (
                <DateField
                  {...f}
                  value={f.value as DateOnly | ''}
                  label={t('productionDate')}
                  optional
                  max={todayDateOnly()}
                />
              )}
            </form.Field>
            <form.Field name="expiryDate">
              {(f) => <DateField {...f} value={f.value as DateOnly | ''} label={t('expiryDate')} optional />}
            </form.Field>
          </Section>
        ) : (
          <Button type="button" variant="secondary" block onClick={() => setDetails(true)}>
            {t('datesManufacturerPrice')}
          </Button>
        )}
      </EntryShell>
    </form>
  );
}
