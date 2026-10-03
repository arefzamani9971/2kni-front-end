'use client';
import { useAppForm, rules, s } from '@dukani/forms';
import { Button, FlowShell, LocationField, Section, TextField } from '@dukani/ui-kit';
import { useState } from 'react';
import type { StoreLocationDraft } from '../../domain/store-draft.types';
import { StepColumns } from './StepColumns';

const schema = s.object({ addressLine: rules.optionalText('نشانی', 400) });

/**
 * storelocation «موقعیت فروشگاه» (Figma 594:6736; desktop 597:4205). Optional: a refused location
 * permission never blocks the form — the address can always be typed (F02-S13). Lat/lng go as a pair;
 * 0,0 is a valid point (F02-S14).
 */
export function StoreLocationStep({
  addressLine,
  value,
  onSave,
  onSkip,
}: {
  addressLine: string | null;
  value: StoreLocationDraft | null;
  onSave: (addressLine: string | null, location: StoreLocationDraft | null) => void;
  onSkip: () => void;
}) {
  const [point, setPoint] = useState<StoreLocationDraft | null>(value);
  const form = useAppForm({ schema, defaultValues: { addressLine: addressLine ?? '' } });
  const save = form.handleSubmit((v) => onSave(v.addressLine, point));

  return (
    <form noValidate onSubmit={save} className="contents">
      <FlowShell
        appBar={{ title: 'موقعیت فروشگاه', back: onSkip }}
        actions={
          <>
            <Button type="submit" block>
              ذخیره موقعیت
            </Button>
            <Button type="button" variant="secondary" block onClick={onSkip}>
              ادامه بدون موقعیت
            </Button>
          </>
        }
      >
        <StepColumns>
          <Section collapsible title="موقعیت فروشگاه" className="gap-4">
            <form.Field name="addressLine">
              {(f) => <TextField {...f} label="نشانی" optional placeholder="نشانی دقیق فروشگاه" maxLength={400} />}
            </form.Field>
            <LocationField
              label="موقعیت"
              optional
              placeholder="انتخاب نقطه روی نقشه"
              value={point}
              onChange={setPoint}
            />
            <p className="text-body-s text-fg-secondary">اگر دسترسی به موقعیت ممکن نیست، نشانی را دستی وارد کنید.</p>
          </Section>
        </StepColumns>
      </FlowShell>
    </form>
  );
}
