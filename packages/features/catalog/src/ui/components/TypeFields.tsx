'use client';
import { useEffect, useId, useState } from 'react';
import { useFieldValue, useFormAutosave, useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import { useActiveStore, useCan } from '@dukani/platform';
import { Button, PageState } from '@dukani/ui-kit';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { usePackageRows } from '../hooks/use-package-rows';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import type { FormSession } from './CatalogFormSession.types';
import { CatalogQueryState } from './CatalogQueryState';
import { CategoryCreationScene } from './CategoryCreationScene';
import type { CreateTypeFormProps, TypeEditor } from './CreateTypeForm.types';
import { LiveCommandOutcome } from './LiveCommandOutcome';
import { PackageRows } from './PackageRows';
import { typeSchema } from './TypeFields.schema';
import { TypeMainFields } from './TypeMainFields';

/**
 * New product type inside its session: fields, default packages, in-place group creation and the command. The draft
 * follows the form through `useFormAutosave` (packages and the in-place group are reported with `schedule`), and the
 * duplicate offer reads the name in a leaf, so typing re-renders the field only (PAT-FORM-01).
 */
export function TypeFields({
  draftId = 'new',
  onCreated,
  onCancel,
  present,
  session,
}: CreateTypeFormProps & { session: FormSession<TypeEditor> }) {
  const formId = useId();
  const t = useCatalogTexts();
  const rules = useValidationRules();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const { catalog } = useCatalogModule();
  const cats = useCatalogQuery(['categories'], (port, id, signal) => port.categories(id, signal));
  const units = useCatalogQuery(['units'], (port, _id, signal) => port.units(signal));
  const form = useLocalizedAppForm({ schema: typeSchema(t, rules), defaultValues: session.initial.fields });
  const [newCategory, setNewCategory] = useState(session.initial.creation);
  const unitId = useFieldValue(form, 'defaultBaseUnitId');
  const unit = units.data?.find((u) => u.id === unitId);
  const packages = usePackageRows(session.initial.packages, unit?.maxDecimals ?? 3);
  const done = (created: { id: string; name: string }) =>
    void session.clear().then(
      () => onCreated(created),
      () => onCreated(created),
    );
  const command = useCatalogCommand(
    `type:${draftId}`,
    (
      value: {
        name: string;
        categoryId: string;
        defaultBaseUnitId: string;
        defaultPackagings: { name: string; baseQty: string }[];
      },
      operationId,
    ) => catalog.createType(store.id, { ...value, categoryId: value.categoryId || null }, operationId),
    done,
  );
  const editorOf = (values: TypeEditor['fields']): TypeEditor => ({
    fields: {
      name: values.name,
      categoryId: values.categoryId,
      defaultBaseUnitId: values.defaultBaseUnitId,
    },
    packages: packages.rows,
    creation: newCategory,
  });
  const autosave = useFormAutosave(form, {
    select: editorOf,
    save: session.persist,
    enabled: command.state.kind !== 'succeeded',
  });
  const { schedule, flush } = autosave;
  // typing in a package row is a burst; opening or closing the in-place group is a discrete step, saved at once
  useEffect(() => schedule(), [schedule, packages.rows]);
  useEffect(() => void flush(), [flush, newCategory]);
  const leave = () => {
    autosave.flush();
    session.leave(editorOf(form.getValues()), onCancel);
  };
  const submit = form.handleSubmit(async (value) => {
    if (!packages.valid) {
      packages.revealIssues();
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`[data-package-form="${formId}"] [aria-invalid="true"]`)?.focus(),
      );
      return;
    }
    await command.submit({ ...value, defaultPackagings: packages.toRequest() });
  });
  const locked = command.busy || command.unknown || command.state.kind === 'succeeded';
  useEffect(() => {
    if (command.error) form.applyServerError(command.error);
  }, [command.error, form]);
  if (command.loading) return <PageState kind="loading" />;
  if (!can) return <PageState kind="permission" />;
  const actions = (
    <>
      <Button
        form={formId}
        type="submit"
        block
        loading={command.busy}
        disabled={locked || !units.data || !!units.error || !!cats.error}
      >
        {t('saveType')}
      </Button>
      {!present ? (
        <Button type="button" block variant="secondary" onClick={leave} disabled={locked}>
          {t('cancel')}
        </Button>
      ) : null}
    </>
  );
  const content = (
    <form id={formId} noValidate onSubmit={submit} data-package-form={formId} className="flex flex-col gap-4">
      <CatalogQueryState
        pending={cats.isPending || units.isPending}
        error={cats.error ?? units.error}
        retry={() => {
          void cats.refetch();
          void units.refetch();
        }}
      />
      <TypeMainFields
        form={form}
        categories={cats.data}
        units={units.data}
        disabled={locked}
        onCreateCategory={(name) => setNewCategory({ name })}
      />
      <PackageRows packages={packages} maxDecimals={Math.min(3, unit?.maxDecimals ?? 3)} disabled={locked} />
      <form.Value name="name">
        {(name) => (
          <form.Value name="categoryId">
            {(categoryId) => (
              // type names are unique per group (or among ungrouped types)
              <LiveCommandOutcome
                kind="type"
                code="PRODUCT_TYPE_DUPLICATE"
                name={name}
                scope={categoryId || null}
                load={(port, storeId, typed, signal) => port.types(storeId, typed, signal)}
                scopeOf={(row) => row.categoryId}
                unknown={command.unknown}
                error={command.error}
                onRetry={() => void command.retry()}
                onUseDuplicate={(existing) => {
                  autosave.flush();
                  done(existing);
                }}
              />
            )}
          </form.Value>
        )}
      </form.Value>
      {!present ? actions : null}
    </form>
  );
  return (
    <>
      {present ? present(content, actions, leave) : content}
      {newCategory ? (
        <CategoryCreationScene
          draftId={draftId}
          initialName={newCategory.name}
          categories={cats.data ?? []}
          onCancel={() => setNewCategory(null)}
          onCreated={(category) => {
            form.setValue('categoryId', category.id);
            setNewCategory(null);
            void cats.refetch();
          }}
        />
      ) : null}
    </>
  );
}
