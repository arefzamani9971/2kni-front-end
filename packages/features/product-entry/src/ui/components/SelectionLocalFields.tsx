'use client';
import { Section, TextField } from '@dukani/ui-kit';
import { SELECTION_NOTE_MAX, SELECTION_TITLE_MAX } from '../../domain/entry-selection.constants';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import type { SelectionAppForm } from './CatalogSelectionEditor.types';

/** «در فروشگاه شما» for a new store product: its own name (the catalog title by default) and a private note. */
export function SelectionLocalFields({
  form,
  catalogTitle,
}: {
  form: SelectionAppForm;
  catalogTitle: string;
}) {
  const t = useEntryTranslations();
  return (
    <Section title={t('inStore')} className="desktop:p-6">
      <form.Field name="localTitle">
        {(f) => (
          <TextField
            {...f}
            label={t('displayName')}
            optional
            placeholder={catalogTitle}
            maxLength={SELECTION_TITLE_MAX}
          />
        )}
      </form.Field>
      <form.Field name="localNote">
        {(f) => <TextField {...f} label={t('privateNote')} optional maxLength={SELECTION_NOTE_MAX} />}
      </form.Field>
      <p className="text-body-s text-fg-tertiary">{t('privateInfoHint')}</p>
    </Section>
  );
}
