'use client';

import { decimal, formatDecimalFa } from '@dukani/domain';
import { Button, ListRow, Section } from '@dukani/ui-kit';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { baseUnitNameOf, entryUnitsOf, nextStep, titleOf } from '../../domain/entry-draft';
import { BackButton } from './BackButton';
import { EntryShell } from './EntryShell';
import { useEntryNav } from '../hooks/use-entry-nav';
import type { Kind, Save } from './OriginStep.types';

export function OriginStep({
  draft,
  onPick,
  save,
}: {
  draft: EntryDraft;
  onPick: (k: Kind) => void;
  save: Save;
}) {
  const go = useEntryNav();
  const units = entryUnitsOf(draft).filter((u) => !decimal.eq(u.baseQty, decimal.of(1)));
  const base = baseUnitNameOf(draft);
  return (
    <EntryShell title="افزودن موجودی" actions={<BackButton onClick={go.back} />}>
      <Section title="منشأ موجودی">
        <Button variant="secondary" block onClick={() => onPick('Opening')}>
          موجودی از قبل در فروشگاه
        </Button>
        <Button variant="secondary" block onClick={() => onPick('Purchase')}>
          خرید جدید
        </Button>
      </Section>
      <Section title="کالای انتخاب‌شده">
        <ListRow>{titleOf(draft)}</ListRow>
        <ListRow>
          {units.map((u) => `هر ${u.name} = ${formatDecimalFa(u.baseQty)} ${base}`).join(' · ')}
          {units.length ? ' · ' : ''}موجودی بر اساس {base}
        </ListRow>
      </Section>
      <Button
        variant="text"
        block
        onClick={async () => {
          const d = await save((x) => ({ ...x, stock: null, stockDecided: true }));
          if (d) go.step(d.id, nextStep(d, 'stock'));
        }}
      >
        فعلاً بدون موجودی ادامه می‌دهم
      </Button>
    </EntryShell>
  );
}
