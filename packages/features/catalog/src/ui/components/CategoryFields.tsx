'use client';
import { useEffect, useId } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { s, useFormAutosave, useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import { Button, PageState, SelectField, TextField } from '@dukani/ui-kit';
import { categoryParents, flattenCategories } from '../../domain/categories';
import type { CatalogCategory } from '../../domain/catalog.types';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { FormSession } from './CatalogFormSession.types';
import type { CategoryEditor, CreateCategoryFormProps } from './CreateCategoryForm.types';
import { LiveCommandOutcome } from './LiveCommandOutcome';

const editorOf = (values: CategoryEditor): CategoryEditor => ({
  name: values.name,
  parentId: values.parentId,
});

/**
 * New group (name, optional parent within three levels) inside its session. The draft follows the form through
 * `useFormAutosave` and the duplicate offer reads the name in a leaf, so typing re-renders the field only.
 */
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
  const autosave = useFormAutosave(form, {
    select: editorOf,
    save: session.persist,
    enabled: command.state.kind !== 'succeeded',
  });
  const leave = () => {
    autosave.flush();
    session.leave(editorOf(form.getValues()), onCancel);
  };
  const useExisting = (existing: CatalogCategory) => {
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
      <form.Value name="name">
        {(name) => (
          <form.Value name="parentId">
            {(parentId) => (
              // category names are unique per parent level
              <LiveCommandOutcome
                kind="category"
                code="CATEGORY_DUPLICATE"
                name={name}
                scope={parentId || null}
                load={(port, storeId, _name, signal) =>
                  port.categories(storeId, signal).then(flattenCategories)
                }
                scopeOf={(row) => row.parentId}
                unknown={command.unknown}
                error={command.error}
                onRetry={() => void command.retry()}
                onUseDuplicate={useExisting}
              />
            )}
          </form.Value>
        )}
      </form.Value>
    </form>
  );
  return <>{present(content, actions, leave)}</>;
}
