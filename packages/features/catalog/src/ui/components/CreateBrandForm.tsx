'use client';
import { useEffect, useId } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { useLocalizedAppForm, useValidationRules, s } from '@dukani/forms';
import { Alert, Button, FormSection, TextField, useAppErrorMessage, PageState } from '@dukani/ui-kit';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogAutosave, CatalogFormSession, type FormSession } from './CatalogFormSession';
import type { CreateBrandFormProps } from './CreateBrandForm.types';
export function CreateBrandForm(props: CreateBrandFormProps) {
  return (
    <CatalogFormSession<{ name: string }>
      id={'brand:' + (props.draftId ?? 'new')}
      defaults={{ name: props.initialName ?? '' }}
    >
      {(session) => <BrandFields {...props} session={session} />}
    </CatalogFormSession>
  );
}
function BrandFields({
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
  const message = useAppErrorMessage();
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
      {command.unknown ? (
        <PageState
          kind="unknown-result"
          action={
            <Button
              onClick={() => {
                void command.retry();
              }}
            >
              {t('retry')}
            </Button>
          }
        />
      ) : null}
      {command.error ? <Alert tone="danger" title={message(command.error)} /> : null}
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
