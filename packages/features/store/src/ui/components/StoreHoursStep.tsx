'use client';
import { createHoursOptions } from './StoreHoursStep.constants';
import { useStoreTranslations } from '../i18n/use-store-translations';

import { useStorePresentation } from '../i18n/use-store-presentation';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import { Button, FlowShell, FormColumn, Section, SelectField } from '@dukani/ui-kit';
import { isOvernight } from '../../domain/store-draft';
import { DEFAULT_HOURS } from '../../domain/store-draft.constants';
import type { StoreHoursPlan } from '../../domain/store-draft.types';
import { hoursSchema } from './StoreHoursStep.schema';

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
  const t = useStoreTranslations();
  const presentation = useStorePresentation();
  const {
    days: DAY_OPTIONS,
    closed: CLOSED_OPTIONS,
    times: TIMES,
  } = createHoursOptions(t, presentation.digits);

  const form = useAppForm({ schema: hoursSchema(t), defaultValues: { ...DEFAULT_HOURS, ...value } });
  const save = form.handleSubmit((v) => onSave(v));
  const opens = form.watch('opens');
  const closes = form.watch('closes');

  return (
    <form noValidate onSubmit={save} className="contents">
      <FlowShell
        appBar={{ title: t('openingHours'), back: onBack }}
        actions={
          <Button type="submit" block>
            {t('saveHours')}
          </Button>
        }
      >
        <FormColumn size="md">
          <Section collapsible title={t('hours')} className="gap-4">
            <form.Field name="days">
              {(f) => <SelectField {...f} label={t('days')} options={DAY_OPTIONS} />}
            </form.Field>
            <form.Field name="opens">
              {(f) => <SelectField {...f} label={t('openingTime')} options={TIMES} searchable={false} />}
            </form.Field>
            <form.Field name="closes">
              {(f) => (
                <SelectField
                  {...f}
                  label={t('closingTime')}
                  options={TIMES}
                  searchable={false}
                  hint={isOvernight({ opens, closes }) ? t('nextDay') : undefined}
                />
              )}
            </form.Field>
            <form.Field name="closed">
              {(f) => <SelectField {...f} label={t('closed')} optional options={CLOSED_OPTIONS} />}
            </form.Field>
          </Section>
        </FormColumn>
      </FlowShell>
    </form>
  );
}
