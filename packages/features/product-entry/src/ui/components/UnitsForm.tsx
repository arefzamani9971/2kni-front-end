'use client';
import { decimal, formatDecimalFa, parseDecimalInput, type DecimalString } from '@dukani/domain';
import { Button, DecimalField, IconButton, ListRow, Section, TextField } from '@dukani/ui-kit';
import { useState } from 'react';
import { nextStep, type EntryDraft, type NewItem, type Packaging } from '../../domain/entry-draft';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';

type Row = { name: string; baseQty: string; error?: string };

export function UnitsForm({
  draftId,
  item,
  save,
}: {
  draftId: string;
  item: NewItem;
  save: (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;
}) {
  const go = useEntryNav();
  const [rows, setRows] = useState<Row[]>(() => item.packagings.map((p) => ({ name: p.name, baseQty: p.baseQty })));
  const base = item.baseUnitName;

  const next = async () => {
    let ok = true;
    const packs: Packaging[] = [];
    const checked = rows.map((r) => {
      const qty = parseDecimalInput(r.baseQty, { maxDecimals: item.baseUnitMaxDecimals });
      if (!r.name.trim()) return (ok = false), { ...r, error: 'نام بسته را وارد کنید.' };
      if (!qty.ok || !decimal.gt(qty.value, decimal.of(1)))
        return (ok = false), { ...r, error: `تعداد داخل بسته باید بیشتر از یک ${base} باشد.` };
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
      title="واحد و بسته"
      actions={
        <>
          <Button block onClick={next}>
            ادامه به موجودی
          </Button>
          <BackButton onClick={go.back} />
        </>
      }
    >
      <Section title="واحد پایه">
        <ListRow>
          هر {base} = یک {item.productTypeName}
        </ListRow>
        <ListRow>موجودی بر اساس {base} نگهداری می‌شود.</ListRow>
      </Section>
      <Section title="بستهٔ خرید و فروش" description={packHint(rows[0]?.baseQty)}>
        {rows.map((r, i) => (
          <div key={i} className="flex flex-col gap-3 border-b border-line pb-3 last:border-0">
            <div className="flex items-center gap-2">
              <p className="flex-1 text-label-m text-fg-primary">بستهٔ {formatDecimalFa(decimal.of(i + 1))}</p>
              <IconButton icon="trash" label="حذف بسته" tone="danger" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} />
            </div>
            <TextField label="نام بسته" value={r.name} onChange={(v) => setRows((x) => x.map((y, j) => (j === i ? { ...y, name: v } : y)))} maxLength={40} />
            <DecimalField
              label="تعداد هر بسته"
              unit={base}
              maxDecimals={item.baseUnitMaxDecimals}
              value={r.baseQty}
              status={r.error ? 'error' : undefined}
              message={r.error}
              onChange={(v) => setRows((x) => x.map((y, j) => (j === i ? { ...y, baseQty: v, error: undefined } : y)))}
            />
          </div>
        ))}
        <Button variant="secondary" block iconStart="plus" onClick={() => setRows((x) => [...x, { name: x.length ? 'کارتن' : 'بسته', baseQty: '' }])}>
          افزودن بسته
        </Button>
      </Section>
    </EntryShell>
  );
}

const packHint = (qty: string | undefined): string => {
  const parsed = qty ? parseDecimalInput(qty) : null;
  return parsed?.ok
    ? `قیمت فروش بسته می‌تواند با ${formatDecimalFa(parsed.value)} برابر قیمت تکی متفاوت باشد.`
    : 'اگر کالا را بسته‌ای هم می‌خرید یا می‌فروشید، بسته را تعریف کنید.';
};
