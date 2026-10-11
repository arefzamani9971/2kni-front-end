'use client';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { decimal, parseDecimalInput, parseBarcode, type DecimalString } from '@dukani/domain';
import {
  BarcodeField,
  Checkbox,
  Button,
  DecimalField,
  IconButton,
  ListRow,
  Section,
  TextField,
} from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { nextStep } from '../../domain/entry-draft';
import type { EntryDraft, NewItem, Packaging } from '../../domain/entry-draft.types';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import type { EntryTranslator } from '../i18n/types';
import type { Row } from './UnitsForm.types';
import { EntryWorkflow } from './EntryWorkflow';

export function UnitsForm({
  draftId,
  item,
  save,
}: {
  draftId: string;
  item: NewItem;
  save: (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();

  const go = useEntryNav();
  const [rows, setRows] = useState<Row[]>(() => (item.unitsEditor ?? item.packagings).map((p) => ({ ...p })));
  const [saveFailed, setSaveFailed] = useState(false);
  const raw = JSON.stringify(
    rows.map(({ name, baseQty, barcode, isSellable, isPurchasable }) => ({
      name,
      baseQty,
      barcode,
      isSellable,
      isPurchasable,
    })),
  );
  useEffect(() => {
    void save((d) => ({ ...d, newItem: { ...d.newItem!, unitsEditor: JSON.parse(raw) } })).catch(() =>
      setSaveFailed(true),
    );
  }, [raw, save]);
  const base = item.baseUnitName;

  const next = async () => {
    let ok = true;
    const packs: Packaging[] = [];
    const checked = rows.map((r) => {
      const qty = parseDecimalInput(r.baseQty, { maxDecimals: 3 });
      if (!r.name.trim() || r.name.trim().length > 80)
        return ((ok = false), { ...r, error: 'name' as const });
      if (!qty.ok || !decimal.gt(qty.value, decimal.of(0)) || decimal.gt(qty.value, decimal.of('1000000000')))
        return ((ok = false), { ...r, error: 'quantity' as const });
      const barcode = r.barcode?.trim() ? parseBarcode(r.barcode) : null;
      if (barcode && !barcode.ok) return ((ok = false), { ...r, error: 'barcode' as const });
      packs.push({
        name: r.name.trim(),
        baseQty: qty.value as DecimalString,
        barcode: barcode?.ok ? barcode.value : undefined,
        isSellable: r.isSellable ?? true,
        isPurchasable: r.isPurchasable ?? true,
      });
      return { ...r, error: undefined };
    });
    setRows(checked);
    if (!ok) return;
    const d = await save((x) => ({ ...x, newItem: { ...x.newItem!, packagings: packs } }));
    if (d) go.step(draftId, nextStep(d, 'units'));
  };

  return (
    <EntryShell
      back={go.back}
      title={t('unitsPacks')}
      actions={
        <>
          <Button block onClick={next}>
            {t('continueStock')}
          </Button>
          <BackButton onClick={go.back} />
        </>
      }
    >
      {saveFailed ? <p role="alert">{t('draftSaveFailed')}</p> : null}
      <EntryWorkflow current={1} />
      <div className="desktop:grid-cols-2 grid gap-4">
        <Section title={t('catalogUnit')}>
          <ListRow>
            {item.baseUnitName} · {item.productTypeName}
          </ListRow>
        </Section>
        <Section title={t('baseUnit')}>
          <ListRow>{t('baseEquals', { base, type: item.productTypeName })}</ListRow>
          <ListRow>{t('stockBasis', { base })}</ListRow>
        </Section>
      </div>
      <Section title={t('purchaseSalePack')} description={packHint(rows[0]?.baseQty, t, presentation.qty)}>
        {rows.map((r, i) => (
          <div key={i} className="border-line flex flex-col gap-3 border-b pb-3 last:border-0">
            <div className="flex items-center gap-2">
              <p className="text-label-m text-fg-primary flex-1">{t('packOrdinal', { count: i + 1 })}</p>
              <IconButton
                icon="trash"
                label={t('removePack')}
                tone="danger"
                onClick={() => setRows((x) => x.filter((_, j) => j !== i))}
              />
            </div>
            <TextField
              label={t('packName')}
              value={r.name}
              onChange={(v) => setRows((x) => x.map((y, j) => (j === i ? { ...y, name: v } : y)))}
              maxLength={80}
            />
            <DecimalField
              label={t('packQuantity')}
              unit={base}
              maxDecimals={3}
              value={r.baseQty}
              status={r.error ? 'error' : undefined}
              message={
                r.error
                  ? r.error === 'name'
                    ? t('packNameRequired')
                    : t('packQuantityError', { base })
                  : undefined
              }
              onChange={(v) =>
                setRows((x) => x.map((y, j) => (j === i ? { ...y, baseQty: v, error: undefined } : y)))
              }
            />
            <BarcodeField
              label={t('manufacturerBarcode')}
              optional
              value={r.barcode ?? ''}
              status={r.error === 'barcode' ? 'error' : undefined}
              message={r.error === 'barcode' ? t('lookup.invalid') : undefined}
              onChange={(barcode) =>
                setRows((x) => x.map((y, j) => (j === i ? { ...y, barcode, error: undefined } : y)))
              }
            />
            <Checkbox
              label={t('packSellable')}
              checked={r.isSellable ?? true}
              onChange={(isSellable) => setRows((x) => x.map((y, j) => (j === i ? { ...y, isSellable } : y)))}
            />
            <Checkbox
              label={t('packPurchasable')}
              checked={r.isPurchasable ?? true}
              onChange={(isPurchasable) =>
                setRows((x) => x.map((y, j) => (j === i ? { ...y, isPurchasable } : y)))
              }
            />
          </div>
        ))}
        <Button
          variant="secondary"
          block
          disabled={rows.length >= 10}
          iconStart="plus"
          onClick={() => setRows((x) => [...x, { name: x.length ? t('carton') : t('pack'), baseQty: '' }])}
        >
          {t('addPack')}
        </Button>
      </Section>
    </EntryShell>
  );
}

const packHint = (
  qty: string | undefined,
  t: EntryTranslator,
  formatQuantity: (value: string) => string,
): string => {
  const parsed = qty ? parseDecimalInput(qty) : null;
  return parsed?.ok ? t('packPriceHint', { quantity: formatQuantity(parsed.value) }) : t('packHint');
};
