'use client';
import { useEffect, useId } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { useFormAutosave, useLocalizedAppForm, useValidationRules, s } from '@dukani/forms';
import { Button, FormSection, TextField, PageState } from '@dukani/ui-kit';
import type { CatalogBrand } from '../../domain/catalog.types';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { FormSession } from './CatalogFormSession.types';
import type { CreateBrandFormProps } from './CreateBrandForm.types';
import { LiveCommandOutcome } from './LiveCommandOutcome';

const editorOf = (values: { name: string }) => ({ name: values.name });

/**
 * Brand name form inside its session; success selects the new brand in the host form. The draft follows the form
 * through `useFormAutosave` and the duplicate offer reads the name in a leaf, so typing re-renders the field only.
 */
export function BrandFields({
  draftId = 'new',
  onCreated,
  onCancel,
  present,
  session,
}: CreateBrandFormProps & { session: FormSession<{ name: string }> }) {
  const formId = useId();
  const t = useCatalogTexts();
  const rules = useValidationRules();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const { catalog } = useCatalogModule();
  const form = useLocalizedAppForm({
    schema: s.object({ name: rules.requiredText(t('brandName'), 120) }),
    defaultValues: session.initial,
  });
  const command = useCatalogCommand(
    `brand:${draftId}`,
    (value: { name: string }, operationId) => catalog.createBrand(store.id, value.name, operationId),
    (created) => {
      void session.clear().then(
        () => onCreated(created),
        () => onCreated(created),
      );
    },
  );
  const autosave = useFormAutosave(form, {
    select: editorOf,
    save: session.persist,
    enabled: command.state.kind !== 'succeeded',
  });
  const leave = () => {
    autosave.flush();
    session.leave(editorOf(form.getValues()), onCancel);
  };
  const useExisting = (existing: CatalogBrand) => {
    autosave.flush();
    void session.clear().then(
      () => onCreated(existing),
      () => onCreated(existing),
    );
  };
  const locked = command.busy || command.unknown || command.state.kind === 'succeeded';
  useEffect(() => {
    if (command.error) form.applyServerError(command.error);
  }, [command.error, form]);
  if (command.loading) return <PageState kind="loading" />;
  if (!can) return <PageState kind="permission" />;
  const actions = (
    <>
      <Button form={formId} type="submit" block className="mt-auto" loading={command.busy} disabled={locked}>
        {t('saveBrand')}
      </Button>
      {!present ? (
        <Button
          type="button"
          variant="secondary"
          block
          disabled={command.busy || command.unknown}
          onClick={leave}
        >
          {t('cancel')}
        </Button>
      ) : null}
    </>
  );
  const content = (
    <form
      id={formId}
      noValidate
      onSubmit={form.handleSubmit(async (value) => {
        await command.submit(value);
      })}
      className="desktop:flex-none flex flex-1 flex-col gap-4"
    >
      <FormSection title={t('brandNewLabel')} className="desktop:rounded-none desktop:border-0 desktop:p-0">
        <div className="desktop:grid-cols-2 desktop:items-center grid gap-4">
          <form.Field name="name">
            {(field) => (
              <TextField {...field} label={t('brandName')} required maxLength={120} disabled={locked} />
            )}
          </form.Field>
          <p className="text-body-s text-fg-secondary">{t('brandHint')}</p>
        </div>
      </FormSection>
      <form.Value name="name">
        {(name) => (
          <LiveCommandOutcome
            kind="brand"
            code="BRAND_DUPLICATE"
            name={name}
            scope={null}
            load={(port, storeId, typed, signal) => port.brands(storeId, typed, signal)}
            scopeOf={() => null}
            unknown={command.unknown}
            error={command.error}
            onRetry={() => void command.retry()}
            onUseDuplicate={useExisting}
          />
        )}
      </form.Value>
      {!present ? actions : null}
    </form>
  );
  return <>{present ? present(content, actions, leave) : content}</>;
}
