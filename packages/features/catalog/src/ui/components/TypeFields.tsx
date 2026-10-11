'use client';
import { useEffect, useId, useState } from 'react';
import { useLocalizedAppForm, useValidationRules } from '@dukani/forms';
import { useActiveStore, useCan } from '@dukani/platform';
import { Button, PageState } from '@dukani/ui-kit';
import { useCatalogModule } from '../../module';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { useDuplicateMatch } from '../hooks/use-duplicate-match';
import { usePackageRows } from '../hooks/use-package-rows';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogAutosave } from './CatalogAutosave';
import type { FormSession } from './CatalogFormSession.types';
import { CatalogQueryState } from './CatalogQueryState';
import { CategoryCreationScene } from './CategoryCreationScene';
import { CommandOutcome } from './CommandOutcome';
import type { CreateTypeFormProps, TypeEditor } from './CreateTypeForm.types';
import { PackageRows } from './PackageRows';
import { typeSchema } from './TypeFields.schema';
import { TypeMainFields } from './TypeMainFields';

/** New product type inside its session: fields, default packages, in-place group creation and the command. */
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
  const unit = units.data?.find((u) => u.id === form.watch('defaultBaseUnitId'));
  const packages = usePackageRows(session.initial.packages, unit?.maxDecimals ?? 3);
  const done = (created: { id: string; name: string }) =>
    void session.clear().then(
      () => onCreated(created),
      () => onCreated(created),
    );
  const command = useCatalogCommand(
    `type:${draftId}`,
    (
      value: { name: string; categoryId: string; defaultBaseUnitId: string; defaultPackagings: { name: string; baseQty: string }[] },
      operationId,
    ) => catalog.createType(store.id, { ...value, categoryId: value.categoryId || null }, operationId),
    done,
  );
  const snapshot: TypeEditor = {
    fields: {
      name: form.watch('name'),
      categoryId: form.watch('categoryId'),
      defaultBaseUnitId: form.watch('defaultBaseUnitId'),
    },
    packages: packages.rows,
    creation: newCategory,
  };
  const leave = () => session.leave(snapshot, onCancel);
  // type names are unique per group (or among ungrouped types)
  const duplicate = useDuplicateMatch({
    kind: 'type',
    error: command.error,
    code: 'PRODUCT_TYPE_DUPLICATE',
    current: { name: snapshot.fields.name, scope: snapshot.fields.categoryId || null },
    load: (port, storeId, name, signal) => port.types(storeId, name, signal),
    scopeOf: (row) => row.categoryId,
  });
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
      <CommandOutcome
        unknown={command.unknown}
        onRetry={() => void command.retry()}
        duplicateName={duplicate?.name ?? null}
        onUseDuplicate={() => duplicate && done(duplicate)}
        error={command.error}
      />
      {!present ? actions : null}
    </form>
  );
  return (
    <>
      <CatalogAutosave value={snapshot} session={session} disabled={command.state.kind === 'succeeded'} />
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
