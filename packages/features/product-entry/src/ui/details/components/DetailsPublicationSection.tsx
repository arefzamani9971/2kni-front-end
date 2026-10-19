'use client';
import type { AppError } from '@dukani/domain';
import {
  Alert,
  Checkbox,
  DecimalField,
  ListRow,
  Section,
  SelectField,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import type { DetailsForm } from '../types/NewItemDetails.types';

/** Net content (goods only) and the private-now / public-review choice. */
export function DetailsPublicationSection({
  form,
  service,
  contentUnits,
  unitsError,
  submitForPublicReview,
  onPublicReviewChange,
}: {
  form: DetailsForm;
  service: boolean;
  contentUnits: readonly { readonly id: string; readonly name: string }[];
  unitsError: AppError | null;
  submitForPublicReview: boolean;
  onPublicReviewChange: (value: boolean) => void;
}) {
  const t = useEntryTranslations();
  const errorMessage = useAppErrorMessage();
  return (
    <Section title={t('publication')}>
      {!service ? (
        <div className="desktop:grid-cols-2 grid gap-4">
          <form.Field name="netContentValue">
            {(f) => <DecimalField {...f} label={t('netContent')} optional maxDecimals={3} />}
          </form.Field>
          <form.Field name="netContentUnitId">
            {(f) => (
              <SelectField
                {...f}
                label={t('netContentUnit')}
                optional
                options={contentUnits.map((u) => ({ value: u.id, label: u.name }))}
              />
            )}
          </form.Field>
          {unitsError ? (
            <Alert tone="danger" title={t('incomplete')} description={errorMessage(unitsError)} />
          ) : null}
        </div>
      ) : null}
      <ListRow>{t('privateImmediately')}</ListRow>
      <ListRow>{t('adminApproval')}</ListRow>
      <Checkbox
        label={t('requestPublicReview')}
        checked={submitForPublicReview}
        disabled={service}
        onChange={onPublicReviewChange}
      />
    </Section>
  );
}
