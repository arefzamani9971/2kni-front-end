'use client';
import { useEffect, useId } from 'react';
import type { ReactNode } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { s, useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import { Alert, Button, PageState, SelectField, TextField, useAppErrorMessage } from '@dukani/ui-kit';
import type { CatalogCategory } from '../../domain/catalog.types';
import { categoryParents } from '../../domain/categories';
import { useCatalogModule } from '../../module';
import { CatalogAutosave, CatalogFormSession, type FormSession } from './CatalogFormSession';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useCatalogTexts } from '../i18n/use-catalog-translations';

type Props = {
  draftId: string;
  initialName: string;
  categories: readonly CatalogCategory[];
  onCreated: (category: CatalogCategory) => void;
  onCancel: () => void;
  present: (content: ReactNode, actions: ReactNode, onLeave: () => void) => ReactNode;
};

type CategoryEditor = { name: string; parentId: string };
export function CreateCategoryForm(props: Props) {
  return (
    <CatalogFormSession<CategoryEditor>
      id={'category:' + props.draftId}
      defaults={{ name: props.initialName, parentId: '' }}
    >
      {(session) => <CategoryFields {...props} session={session} />}
    </CatalogFormSession>
  );
}
function CategoryFields({
  draftId,
  categories,
  onCreated,
  onCancel,
  present,
  session,
}: Props & { session: FormSession<CategoryEditor> }) {
  const formId = useId();
  const t = useCatalogTexts();
  const rules = useValidationRules();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const message = useAppErrorMessage();
  const { catalog } = useCatalogModule();
  const form = useLocalizedAppForm({
    schema: s.object({ name: rules.requiredText(t('name'), 120), parentId: s.string() }),
    defaultValues: session.initial,
  });
  const command = useCatalogCommand(
    `category:${draftId}`,
    (value: { name: string; parentId: string }, operationId) =>
      catalog.createCategory(store.id, value.name, value.parentId || null, operationId),
    (created) => {
      void session.clear().then(
        () => onCreated(created),
        () => onCreated(created),
      );
    },
  );
  const snapshot = { name: form.watch('name'), parentId: form.watch('parentId') };
  const leave = () => session.leave(snapshot, onCancel);
  const locked = command.busy || command.unknown || command.state.kind === 'succeeded';
  useEffect(() => {
    if (command.error) form.applyServerError(command.error);
  }, [command.error, form]);
  if (!can) return <PageState kind="permission" />;
  if (command.loading) return <PageState kind="loading" />;
  const actions = (
    <>
      <Button form={formId} type="submit" block loading={command.busy} disabled={locked}>
        {t('saveCategory')}
      </Button>
      <Button type="button" variant="secondary" block onClick={leave} disabled={locked}>
        {t('cancel')}
      </Button>
    </>
  );
  const content = (
    <form
      id={formId}
      noValidate
      onSubmit={form.handleSubmit(async (value) => {
        await command.submit(value);
      })}
      className="flex flex-col gap-4"
    >
      <form.Field name="name">
        {(field) => <TextField {...field} label={t('name')} required maxLength={120} disabled={locked} />}
      </form.Field>
      <form.Field name="parentId">
        {(field) => (
          <SelectField
            {...field}
            label={t('parent')}
            optional
            disabled={locked}
            options={[
              { value: '', label: t('noCategory') },
              ...categoryParents(categories).map((row) => ({ value: row.id, label: row.name })),
            ]}
          />
        )}
      </form.Field>
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
    </form>
  );
  return (
    <>
      <CatalogAutosave value={snapshot} session={session} disabled={command.state.kind === 'succeeded'} />
      {present(content, actions, leave)}
    </>
  );
}
