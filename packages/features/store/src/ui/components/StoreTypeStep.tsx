'use client';
import { Button, FlowShell, PageState, RadioGroup } from '@dukani/ui-kit';
import { useState } from 'react';
import type { StoreType } from '../../application/ports';
import { STORE_TYPE_HINTS } from '../../domain/store.constants';

export function StoreTypeStep({
  types,
  loading,
  value,
  onPick,
  onBack,
}: {
  types: readonly StoreType[];
  loading: boolean;
  value: string;
  onPick: (t: StoreType) => void;
  onBack: () => void;
}) {
  const [choice, setChoice] = useState(value || types[0]?.id || '');
  const chosen = types.find((t) => t.id === choice);
  return (
    <FlowShell
      appBar={{ title: 'نوع فروشگاه', back: onBack }}
      actions={
        <Button block disabled={!chosen} onClick={() => chosen && onPick(chosen)}>
          {chosen ? `انتخاب ${chosen.name}` : 'انتخاب نوع'}
        </Button>
      }
    >
      <h1 className="text-heading-l text-fg-primary">نوع فروشگاه</h1>
      <p className="text-body-m text-fg-secondary">
        ویژگی‌ها و پیشنهادهای کالا بر اساس این انتخاب تنظیم می‌شوند.
      </p>
      {loading ? (
        <PageState kind="loading" rows={4} />
      ) : (
        <RadioGroup
          label="نوع فروشگاه"
          indicator={false}
          value={choice}
          onChange={setChoice}
          options={types.map((t) => ({ value: t.id, label: t.name, description: STORE_TYPE_HINTS[t.key] }))}
        />
      )}
    </FlowShell>
  );
}
