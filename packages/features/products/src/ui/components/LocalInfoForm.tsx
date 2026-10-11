'use client';
import { useLocalizedAppForm as useAppForm, useValidationRules } from '@dukani/forms';
import {
  Button,
  FormScene,
  MoneyField,
  Section,
  Switch,
  TextField,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { LOCAL_NOTE_MAX, LOCAL_TITLE_MAX, localInfoValues } from '../../domain/local-info';
import { useProductTranslations } from '../i18n/use-product-translations';
import { localInfoSchema } from './LocalInfoForm.schema';
import type { LocalInfoFormProps } from './LocalInfoForm.types';

/**
 * PRD-LOCAL-EDIT «نام و یادداشت فروشگاه»: a page on mobile (Figma 312:9574) and a dialog over the product on desktop
 * (312:1499) — «ویرایش محلی» with name and private note, and «سوابق محفوظ‌اند». A service also edits its manual cost.
 */
export function LocalInfoForm({ product, open, busy, banner, onSave, onBack }: LocalInfoFormProps) {
  const t = useProductTranslations();
  const errorMessage = useAppErrorMessage();
  const validationRules = useValidationRules();
  const initial = localInfoValues(product);
  const form = useAppForm({
    schema: localInfoSchema(t, validationRules),
    defaultValues: {
      localTitle: initial.localTitle,
      localNote: initial.localNote,
      changeServiceCost: false,
      serviceCost: initial.serviceCostAmount ?? '',
    },
  });
  const changeCost = form.watch('changeServiceCost');
  const submit = form.handleSubmit(async (v) => {
    const error = await onSave({
      localTitle: v.localTitle ?? '',
      localNote: v.localNote ?? '',
      changeServiceCost: v.changeServiceCost,
      serviceCostAmount: v.serviceCost?.amount ?? null,
    });
    if (error && !form.applyServerError(error) && error.code === 'TITLE_DUPLICATE')
      form.setFieldError('localTitle', errorMessage(error));
  });
  const back = () => onBack(form.formState.isDirty);

  return (
    <FormScene
      open={open}
      onOpenChange={(next) => (next ? undefined : back())}
      title={t('local.title')}
      actions={
        <>
          <Button block loading={busy} disabled={busy} onClick={() => void submit()}>
            {t('local.save')}
          </Button>
          <Button block variant="secondary" disabled={busy} onClick={back}>
            {t('local.back')}
          </Button>
        </>
      }
    >
      {banner}
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <Section title={t('local.section')} className="desktop:border-0 desktop:p-0">
          <div className="desktop:grid-cols-2 grid gap-4">
            <form.Field name="localTitle">
              {(f) => (
                <TextField
                  {...f}
                  label={t('local.localTitle')}
                  maxLength={LOCAL_TITLE_MAX}
                  hint={t('local.localTitleHint', { title: product.catalogTitle })}
                />
              )}
            </form.Field>
            <form.Field name="localNote">
              {(f) => <TextField {...f} label={t('local.localNote')} maxLength={LOCAL_NOTE_MAX} />}
            </form.Field>
          </div>
          {product.kind === 'Service' ? (
            <>
              <form.Field name="changeServiceCost">
                {(f) => (
                  <Switch checked={f.value} onChange={f.onChange} label={t('local.changeServiceCost')} />
                )}
              </form.Field>
              {changeCost ? (
                <form.Field name="serviceCost">
                  {(f) => (
                    <MoneyField
                      {...f}
                      label={t('local.serviceCost')}
                      optional
                      hint={t('local.serviceCostHint')}
                    />
                  )}
                </form.Field>
              ) : null}
            </>
          ) : null}
        </Section>
        <Section title={t('local.keptTitle')} className="desktop:bg-muted desktop:border-0">
          <p className="text-body-m text-fg-primary">{t('local.keptIdentity')}</p>
          <p className="text-body-m text-fg-primary">{t('local.keptModel')}</p>
        </Section>
      </form>
    </FormScene>
  );
}
