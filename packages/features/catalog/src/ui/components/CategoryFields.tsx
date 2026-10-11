'use client';
import { useEffect, useId } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { s, useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import { Button, PageState, SelectField, TextField } from '@dukani/ui-kit';
import { categoryParents, flattenCategories } from '../../domain/categories';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useDuplicateMatch } from '../hooks/use-duplicate-match';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogAutosave } from './CatalogAutosave';
import type { FormSession } from './CatalogFormSession.types';
import { CommandOutcome } from './CommandOutcome';
import type { CategoryEditor, CreateCategoryFormProps } from './CreateCategoryForm.types';

/** New group (name, optional parent within three levels) inside its session. */
export function CategoryFields({
  draftId,
  categories,
  onCreated,
  onCancel,
  present,
  session,
}: CreateCategoryFormProps & { session: FormSession<CategoryEditor> }) {
  const formId = useId();
  const t = useCatalogTexts();
  const rules = useValidationRules();
  const store = useActiveStore();
  const can = useCan('product.manage');
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
  // category names are unique per parent level
  const duplicate = useDuplicateMatch({
    kind: 'category',
    error: command.error,
    code: 'CATEGORY_DUPLICATE',
    current: { name: snapshot.name, scope: snapshot.parentId || null },
    load: (port, storeId, _name, signal) => port.categories(storeId, signal).then(flattenCategories),
    scopeOf: (row) => row.parentId,
  });
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
      <CommandOutcome
        unknown={command.unknown}
        onRetry={() => void command.retry()}
        duplicateName={duplicate?.name ?? null}
        onUseDuplicate={() => {
          if (duplicate)
            void session.clear().then(
              () => onCreated(duplicate),
              () => onCreated(duplicate),
            );
        }}
        error={command.error}
      />
    </form>
  );
  return (
    <>
      <CatalogAutosave value={snapshot} session={session} disabled={command.state.kind === 'succeeded'} />
      {present(content, actions, leave)}
    </>
  );
}
