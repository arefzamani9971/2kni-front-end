'use client';
import { decimal } from '@dukani/domain';
import { Alert, Button, ListRow, Section, TextField } from '@dukani/ui-kit';
import { nextStep, type EntryDraft } from '../../domain/entry-draft';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useState } from 'react';

type Save = (update: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null>;

export function CatalogDetails({ draft, save }: { draft: EntryDraft; save: Save }) {
  const go = useEntryNav();
  const item = draft.catalog!;
  const [localTitle, setLocalTitle] = useState(draft.localTitle);
  const packs = item.units.filter((u) => !decimal.eq(u.baseQty, decimal.of(1)));
  const next = async () => {
    const d = await save((x) => ({ ...x, localTitle }));
    if (d) go.step(d.id, nextStep(d, 'details'));
  };
  return (
    <EntryShell
      title="انتخاب کالای کاتالوگ"
      actions={
        <>
          <Button block onClick={next}>
            ادامه به موجودی
          </Button>
          <BackButton onClick={go.back} />
        </>
      }
    >
      <Section title={item.title}>
        <ListRow>
          نوع: {item.typeName}
          {item.brandName ? ` · برند: ${item.brandName}` : ''}
        </ListRow>
        <ListRow>
          واحد پایه و فروش: {item.baseUnitName}
          {packs.length ? ` (${packs.map((p) => p.name).join('، ')})` : ''}
        </ListRow>
      </Section>
      {item.storeProductId ? (
        <Alert tone="info" title="این کالا در فروشگاه شما هست" description="موجودی به همان کالا اضافه می‌شود و قیمت فعلی آن تغییر نمی‌کند." />
      ) : (
        <Section title="در فروشگاه شما">
          <TextField label="نام نمایشی" optional value={localTitle} onChange={setLocalTitle} placeholder={item.title} maxLength={160} hint="اگر خالی بماند، نام کاتالوگ نمایش داده می‌شود." />
        </Section>
      )}
    </EntryShell>
  );
}
