'use client';
import { useEffect, useId } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { useLocalizedAppForm, useValidationRules, s } from '@dukani/forms';
import { Button, FormSection, TextField, PageState } from '@dukani/ui-kit';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useDuplicateMatch } from '../hooks/use-duplicate-match';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogAutosave } from './CatalogAutosave';
import type { FormSession } from './CatalogFormSession.types';
import { CommandOutcome } from './CommandOutcome';
import type { CreateBrandFormProps } from './CreateBrandForm.types';

/** Brand name form inside its session; success selects the new brand in the host form. */
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
  const snapshot = { name: form.watch('name') };
  const duplicate = useDuplicateMatch({
    kind: 'brand',
    error: command.error,
    code: 'BRAND_DUPLICATE',
    current: { name: snapshot.name, scope: null },
    load: (port, storeId, name, signal) => port.brands(storeId, name, signal),
    scopeOf: () => null,
  });
  const leave = () => session.leave(snapshot, onCancel);
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
      <CommandOutcome
        unknown={command.unknown}
        onRetry={() => void command.retry()}
        duplicateName={duplicate?.name ?? null}
        onUseDuplicate={() => {
          if (duplicate) void session.clear().then(() => onCreated(duplicate), () => onCreated(duplicate));
        }}
        error={command.error}
      />
      {!present ? actions : null}
    </form>
  );
  return (
    <>
      <CatalogAutosave value={snapshot} session={session} disabled={command.state.kind === 'succeeded'} />
      {present ? present(content, actions, leave) : content}
    </>
  );
}
