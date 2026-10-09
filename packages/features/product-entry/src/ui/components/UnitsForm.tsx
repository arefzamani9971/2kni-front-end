'use client';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { decimal, parseDecimalInput, type DecimalString } from '@dukani/domain';
import { Button, DecimalField, IconButton, ListRow, Section, TextField } from '@dukani/ui-kit';
import { useState } from 'react';
import { nextStep } from '../../domain/entry-draft';
import type { EntryDraft, NewItem, Packaging } from '../../domain/entry-draft.types';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import type { EntryTranslator } from '../i18n/types';
import type { Row } from './UnitsForm.types';

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
  const [rows, setRows] = useState<Row[]>(() =>
    item.packagings.map((p) => ({ name: p.name, baseQty: p.baseQty })),
  );
  const base = item.baseUnitName;

  const next = async () => {
    let ok = true;
    const packs: Packaging[] = [];
    const checked = rows.map((r) => {
      const qty = parseDecimalInput(r.baseQty, { maxDecimals: item.baseUnitMaxDecimals });
      if (!r.name.trim()) return ((ok = false), { ...r, error: 'name' as const });
      if (!qty.ok || !decimal.gt(qty.value, decimal.of(1)))
        return ((ok = false), { ...r, error: 'quantity' as const });
      packs.push({ name: r.name.trim(), baseQty: qty.value as DecimalString });
      return { ...r, error: undefined };
    });
    setRows(checked);
    if (!ok) return;
    const d = await save((x) => ({ ...x, newItem: { ...x.newItem!, packagings: packs } }));
    if (d) go.step(draftId, nextStep(d, 'units'));
  };

  return (
    <EntryShell
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
      <Section title={t('baseUnit')}>
        <ListRow>{t('baseEquals', { base, type: item.productTypeName })}</ListRow>
        <ListRow>{t('stockBasis', { base })}</ListRow>
      </Section>
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
              maxLength={40}
            />
            <DecimalField
              label={t('packQuantity')}
              unit={base}
              maxDecimals={item.baseUnitMaxDecimals}
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
          </div>
        ))}
        <Button
          variant="secondary"
          block
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
