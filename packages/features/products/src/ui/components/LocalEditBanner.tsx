'use client';
import { Alert, useAppErrorMessage } from '@dukani/ui-kit';
import type { LocalEditState } from '../hooks/use-local-edit.types';
import { useProductPresentation } from '../i18n/use-product-presentation';
import { useProductTranslations } from '../i18n/use-product-translations';

/** Save outcome of the local edit: 409 with the fresh values, unknown result, or a failure without field errors. */
export function LocalEditBanner({ state }: { state: LocalEditState }) {
  const t = useProductTranslations();
  const presentation = useProductPresentation();
  const errorMessage = useAppErrorMessage();
  if (state.kind === 'conflict') {
    const value = (v: string | null | undefined) => (v && v.trim() ? v : t('local.empty'));
    const values = state.fields.map((field) =>
      field === 'serviceCost'
        ? t('local.conflictField.serviceCost', {
            value: presentation.price(state.fresh.serviceCostAmount) ?? t('local.empty'),
          })
        : t(`local.conflictField.${field}`, {
            value: value(field === 'localTitle' ? state.fresh.localTitle : state.fresh.localNote),
          }),
    );
    return (
      <Alert
        tone="warning"
        title={t('local.conflictTitle')}
        description={
          values.length ? t('local.conflictHint', { values: values.join('، ') }) : t('local.conflictSame')
        }
      />
    );
  }
  if (state.kind === 'unknown')
    return <Alert tone="warning" title={t('local.unknownTitle')} description={t('local.unknownHint')} />;
  // field errors (and a duplicate title) are shown next to the input instead
  if (state.kind === 'failed' && state.error.kind !== 'Validation' && state.error.code !== 'TITLE_DUPLICATE')
    return <Alert tone="danger" title={t('local.failed')} description={errorMessage(state.error)} />;
  return null;
}
