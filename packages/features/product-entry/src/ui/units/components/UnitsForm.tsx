'use client';
import type { Save } from '../../common/types/use-entry-draft.types';
import { useEntryPresentation } from '../../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../../i18n/use-entry-translations';

import { parseDecimalInput } from '@dukani/domain';
import { Button, ListRow, Section } from '@dukani/ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { nextStep } from '../../../domain/entry-draft';
import type { NewItem } from '../../../domain/entry-draft.types';
import { checkPackRows } from '../../../domain/pack-rows';
import type { PackRow } from '../../../domain/pack-rows.types';
import { BackButton } from '../../common/components/BackButton';
import { EntryShell } from '../../common/components/EntryShell';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import type { EntryTranslator } from '../../i18n/types';
import type { Row } from '../types/UnitsForm.types';
import { EntryWorkflow } from '../../common/components/EntryWorkflow';
import { UnitPackRow } from './UnitPackRow';

export function UnitsForm({ draftId, item, save }: { draftId: string; item: NewItem; save: Save }) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();

  const go = useEntryNav();
  const [rows, setRows] = useState<Row[]>(() => (item.unitsEditor ?? item.packagings).map((p) => ({ ...p })));
  const [saveFailed, setSaveFailed] = useState(false);
  const changeRow = useCallback((index: number, change: Partial<PackRow>) => {
    setRows((current) =>
      current.map((row, i) => (i === index ? { ...row, ...change, error: undefined } : row)),
    );
  }, []);
  const removeRow = useCallback((index: number) => {
    setRows((current) => current.filter((_, i) => i !== index));
  }, []);
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
        {rows.map((row, index) => (
          <UnitPackRow
            key={index}
            row={row}
            index={index}
            base={base}
            maxDecimals={maxDecimals}
            onChange={changeRow}
            onRemove={removeRow}
          />
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
