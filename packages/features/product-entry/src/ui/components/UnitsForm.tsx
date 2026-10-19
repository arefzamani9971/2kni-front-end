'use client';
import type { Save } from '../common/types/use-entry-draft.types';
import { useEntryPresentation } from '../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { parseDecimalInput } from '@dukani/domain';
import {
  BarcodeField,
  Checkbox,
  Button,
  DecimalField,
  IconButton,
  ListRow,
  Section,
  Text,
  TextField,
} from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { nextStep } from '../../domain/entry-draft';
import type { NewItem } from '../../domain/entry-draft.types';
import { checkPackRows, PACK_NAME_MAX } from '../../domain/pack-rows';
import { BackButton } from '../common/components/BackButton';
import { EntryShell } from '../common/components/EntryShell';
import { useEntryNav } from '../common/hooks/use-entry-nav';
import type { EntryTranslator } from '../i18n/types';
import type { Row } from './UnitsForm.types';
import { EntryWorkflow } from '../common/components/EntryWorkflow';

export function UnitsForm({ draftId, item, save }: { draftId: string; item: NewItem; save: Save }) {
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
  // a count base unit takes whole package sizes; weights and volumes up to three decimals (F12 §11)
  const maxDecimals = Math.min(3, item.baseUnitMaxDecimals);

  const next = async () => {
    const { errors, packs } = checkPackRows(rows, base, item.baseUnitMaxDecimals);
    setRows((x) => x.map((r, i) => ({ ...r, error: errors[i] })));
    if (!packs) return;
    const d = await save((x) => {
      const changed = JSON.stringify(x.newItem!.packagings) !== JSON.stringify(packs);
      // raw pack prices are keyed by position: a changed package list starts them again (saved ones re-check the pack)
      const pricingEditor =
        changed && x.pricingEditor ? { ...x.pricingEditor, packPrices: [] } : x.pricingEditor;
      return { ...x, pricingEditor, newItem: { ...x.newItem!, packagings: packs } };
    });
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
              status={r.error === 'name' || r.error === 'duplicate' ? 'error' : undefined}
              message={
                r.error === 'name'
                  ? t('packNameRequired')
                  : r.error === 'duplicate'
                    ? t('packNameDuplicate')
                    : undefined
              }
              onChange={(v) =>
                setRows((x) => x.map((y, j) => (j === i ? { ...y, name: v, error: undefined } : y)))
              }
              maxLength={PACK_NAME_MAX}
            />
            <DecimalField
              label={t('packQuantity')}
              unit={base}
              maxDecimals={maxDecimals}
              value={r.baseQty}
              status={r.error === 'quantity' ? 'error' : undefined}
              message={
                r.error === 'quantity'
                  ? t(maxDecimals ? 'packQuantityError' : 'packQuantityWhole', { base })
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
              onChange={(isSellable) =>
                setRows((x) => x.map((y, j) => (j === i ? { ...y, isSellable, error: undefined } : y)))
              }
            />
            <Checkbox
              label={t('packPurchasable')}
              checked={r.isPurchasable ?? true}
              onChange={(isPurchasable) =>
                setRows((x) => x.map((y, j) => (j === i ? { ...y, isPurchasable, error: undefined } : y)))
              }
            />
            {r.error === 'uses' ? (
              <Text variant="body-s" tone="danger" role="alert">
                {t('packUsesRequired')}
              </Text>
            ) : null}
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
