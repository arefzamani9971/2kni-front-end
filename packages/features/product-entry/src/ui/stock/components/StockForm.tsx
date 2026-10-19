'use client';
import { useFieldValue, useValidationRules } from '@dukani/forms';
import { useEntryPresentation } from '../../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { useFormAnalytics } from '../../common/hooks/use-form-analytics';
import { decimal, fitsBaseQuantity, todayDateOnly, type DateOnly } from '@dukani/domain';

import {
  Alert,
  Button,
  DateField,
  DecimalField,
  MoneyField,
  Section,
  SelectField,
  TextField,
} from '@dukani/ui-kit';
import { useState } from 'react';
import { baseUnitNameOf, entryUnitsOf, maxDecimalsOf, nextStep } from '../../../domain/entry-draft';
import { initialStockUnit } from '../../../domain/stock-unit';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { BackButton } from '../../common/components/BackButton';
import { EntryShell } from '../../common/components/EntryShell';
import { useSuppliers } from '../../common/hooks/use-suppliers';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import type { Kind } from '../types/StockForm.types';
import type { Save } from '../../common/types/use-entry-draft.types';
import { createCostOptions } from '../constants/StockForm.constants';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { schemaFor } from '../schemas/StockForm.schema';
import { useDraftEditor } from '../../common/hooks/use-draft-editor';
import { EntryWorkflow } from '../../common/components/EntryWorkflow';
import { StockConversionPreview } from './StockConversionPreview';
import { StockUnitNotice } from './StockUnitNotice';

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
  const unitChoice = initialStockUnit(draft, units, kind);
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schemaFor(maxDecimalsOf(draft), t, validationRules),
    defaultValues: {
      quantity: s0?.quantity ?? '',
      costStatus: s0?.costStatus ?? 'Known',
      unitCost: s0?.unitCost?.amount ?? '',
      supplierId: s0?.supplierId ?? '',
      invoiceNo: s0?.supplierInvoiceNo ?? '',
      productionDate: s0?.productionDate ?? '',
      expiryDate: s0?.expiryDate ?? '',
      manufacturerPrice: s0?.manufacturerPrice?.amount ?? '',
      printedPrice: s0?.printedPrice?.amount ?? '',
      ...(draft.stockEditor?.kind === kind ? draft.stockEditor.fields : {}),
      unitKey: unitChoice.key,
    },
  });
  useFormAnalytics(form.formState);
  const [details, setDetails] = useState(!!(s0?.productionDate || s0?.expiryDate));
  const saveFailed = useDraftEditor(
    form,
    'stockEditor',
    (v) => ({
      kind,
      fields: {
        quantity: v.quantity,
        unitKey: v.unitKey,
        costStatus: v.costStatus,
        unitCost: v.unitCost,
        supplierId: v.supplierId,
        invoiceNo: v.invoiceNo,
        productionDate: v.productionDate,
        expiryDate: v.expiryDate,
        manufacturerPrice: v.manufacturerPrice ?? '',
        printedPrice: v.printedPrice ?? '',
      },
    }),
    save,
  );
  // discrete choices re-render the step; the quantity is followed by the conversion leaf only
  const cost = useFieldValue(form, 'costStatus');
  const unitKey = useFieldValue(form, 'unitKey');
  const unit = units.find((u) => u.key === unitKey) ?? units[0];

  const submit = form.handleSubmit(async (v) => {
    const chosen = units.find((u) => u.key === v.unitKey);
    if (!chosen) return;
    // the exact base quantity must fit the base unit, as the server checks (F12 §7, §11)
    if (!fitsBaseQuantity(v.quantity, chosen.baseQty, maxDecimalsOf(draft))) {
      form.setFieldError('quantity', t('quantityBaseInvalid', { unit: base }));
      form.focus('quantity');
      return;
    }
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
        manufacturerPrice: v.manufacturerPrice,
        printedPrice: v.printedPrice,
      },
    }));
    if (d) go.step(d.id, nextStep(d, 'stock'));
  });

  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        back={onChangeOrigin}
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
        {saveFailed ? <Alert tone="danger" title={t('draftSaveFailed')} /> : null}
        <EntryWorkflow current={1} />
        {unitKey ? null : (
          <StockUnitNotice notice={unitChoice.notice} scannedUnitName={draft.scanContext?.unitName} />
        )}
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
          <StockConversionPreview form={form} draft={draft} unitKey={unitKey} />
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
              {(f) => <TextField {...f} label={t('supplierInvoice')} optional maxLength={64} dir="auto" />}
            </form.Field>
          </Section>
        ) : null}
        {details ? (
          <Section title={t('productionExpiry')}>
            <form.Field name="manufacturerPrice">
              {(f) => <MoneyField {...f} label={t('manufacturerPrice')} optional />}
            </form.Field>
            <form.Field name="printedPrice">
              {(f) => <MoneyField {...f} label={t('printedPrice')} optional />}
            </form.Field>
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
