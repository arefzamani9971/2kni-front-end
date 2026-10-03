'use client';
import { toPersianDigits } from '@dukani/domain';
import { useAppForm } from '@dukani/forms';
import { Button, FlowShell, Section, SelectField } from '@dukani/ui-kit';
import { isOvernight } from '../../domain/store-draft';
import { CLOSED_PRESETS, DAYS_PRESETS, DEFAULT_HOURS, TIME_OPTIONS } from '../../domain/store-draft.constants';
import type { ClosedPreset, DaysPreset, StoreHoursPlan } from '../../domain/store-draft.types';
import { hoursSchema } from './StoreHoursStep.schema';
import { StepColumns } from './StepColumns';

const DAY_OPTIONS = (Object.keys(DAYS_PRESETS) as DaysPreset[]).map((v) => ({ value: v, label: DAYS_PRESETS[v].label }));
const CLOSED_OPTIONS = (Object.keys(CLOSED_PRESETS) as ClosedPreset[]).map((v) => ({
  value: v,
  label: CLOSED_PRESETS[v].label,
}));
const TIMES = TIME_OPTIONS.map((t) => ({ value: t, label: toPersianDigits(t) }));

/**
 * storehours «روزها و ساعات فعالیت» (Figma 594:6767; desktop 597:4269). Days off are saved as «closed»;
 * days in neither list stay «not set» (F02 §6).
 */
export function StoreHoursStep({
  value,
  onSave,
  onBack,
}: {
  value: StoreHoursPlan | null;
  onSave: (value: StoreHoursPlan) => void;
  onBack: () => void;
}) {
  const form = useAppForm({ schema: hoursSchema, defaultValues: { ...DEFAULT_HOURS, ...value } });
  const save = form.handleSubmit((v) => onSave(v));
  const opens = form.watch('opens');
  const closes = form.watch('closes');

  return (
    <form noValidate onSubmit={save} className="contents">
      <FlowShell
        appBar={{ title: 'روزها و ساعات فعالیت', back: onBack }}
        actions={
          <Button type="submit" block>
            ذخیره ساعات فعالیت
          </Button>
        }
      >
        <StepColumns>
          <Section collapsible title="ساعات فعالیت" className="gap-4">
            <form.Field name="days">
              {(f) => <SelectField {...f} label="روزهای فعالیت" options={DAY_OPTIONS} />}
            </form.Field>
            <form.Field name="opens">
              {(f) => <SelectField {...f} label="شروع فعالیت" options={TIMES} searchable={false} />}
            </form.Field>
            <form.Field name="closes">
              {(f) => (
                <SelectField
                  {...f}
                  label="پایان فعالیت"
                  options={TIMES}
                  searchable={false}
                  hint={isOvernight({ opens, closes }) ? 'پایان کار در روز بعد است.' : undefined}
                />
              )}
            </form.Field>
            <form.Field name="closed">
              {(f) => <SelectField {...f} label="تعطیلی" optional options={CLOSED_OPTIONS} />}
            </form.Field>
          </Section>
        </StepColumns>
      </FlowShell>
    </form>
  );
}
