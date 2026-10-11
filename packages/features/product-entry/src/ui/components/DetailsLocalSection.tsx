'use client';
import { MoneyField, Section, TextField } from '@dukani/ui-kit';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { DetailsForm } from './NewItemDetails.types';

/** Store-only data: display name, note, shortcut, service cost and description. */
export function DetailsLocalSection({ form, service }: { form: DetailsForm; service: boolean }) {
  const t = useEntryTranslations();
  return (
    <Section title={t('localOptions')}>
      <form.Field name="localTitle">
        {(f) => <TextField {...f} label={t('displayName')} optional maxLength={250} />}
      </form.Field>
      <form.Field name="localNote">
        {(f) => <TextField {...f} label={t('localNote')} optional maxLength={1000} />}
      </form.Field>
      <form.Field name="shortcut">
        {(f) => <TextField {...f} label={t('shortcut')} optional maxLength={16} />}
      </form.Field>
      {service ? (
        <form.Field name="serviceCost">
          {(f) => <MoneyField {...f} label={t('serviceCost')} optional />}
        </form.Field>
      ) : null}
      <form.Field name="description">
        {(f) => <TextField {...f} label={t('correction.description')} optional maxLength={2000} />}
      </form.Field>
    </Section>
  );
}
