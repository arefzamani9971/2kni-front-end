'use client';
import { useValidationRules } from '@dukani/forms';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { Button, FlowShell, FormColumn, LocationField, Section, TextField } from '@dukani/ui-kit';
import { useState } from 'react';
import type { StoreLocationDraft } from '../../domain/store-draft.types';
import { schema } from './StoreLocationStep.schema';
import type { StepContext } from './StoreContactStep.types';
import { createStepCopy } from './store-steps.constants';

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
  context = 'setup',
}: {
  addressLine: string | null;
  value: StoreLocationDraft | null;
  onSave: (addressLine: string | null, location: StoreLocationDraft | null) => void;
  onSkip: () => void;
  context?: StepContext;
}) {
  const t = useStoreTranslations();

  const [point, setPoint] = useState<StoreLocationDraft | null>(value);
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schema(t, validationRules),
    defaultValues: { addressLine: addressLine ?? '' },
  });
  const save = form.handleSubmit((v) => onSave(v.addressLine, point));

  return (
    <form noValidate onSubmit={save} className="contents">
      <FlowShell
        appBar={{ title: t('location'), back: onSkip }}
        actions={
          <>
            <Button type="submit" block>
              {t('saveLocation')}
            </Button>
            <Button type="button" variant="secondary" block onClick={onSkip}>
              {createStepCopy(t)[context].locationLeave}
            </Button>
          </>
        }
      >
        <FormColumn size="md">
          <Section collapsible title={t('location')} className="gap-4">
            <form.Field name="addressLine">
              {(f) => (
                <TextField
                  {...f}
                  label={t('address')}
                  optional
                  placeholder={t('exactAddress')}
                  maxLength={400}
                />
              )}
            </form.Field>
            <LocationField
              label={t('mapLocation')}
              optional
              placeholder={t('chooseMap')}
              value={point}
              onChange={setPoint}
            />
            <p className="text-body-s text-fg-secondary">{t('locationHint')}</p>
          </Section>
        </FormColumn>
      </FlowShell>
    </form>
  );
}
