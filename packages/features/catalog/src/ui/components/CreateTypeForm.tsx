'use client';
import { useEffect, useId, useState } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { useLocalizedAppForm, useValidationRules, s } from '@dukani/forms';
import {
  Alert,
  Button,
  DecimalField,
  FormScene,
  SelectField,
  TextField,
  PageState,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import { validPackagings } from '../../domain/packagings';
import { useCatalogModule } from '../../module';
import { flattenCategories } from '../../domain/categories';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { CreateCategoryForm } from './CreateCategoryForm';
import { CatalogQueryState } from './CatalogQueryState';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogAutosave, CatalogFormSession, type FormSession } from './CatalogFormSession';
import type { CreateTypeFormProps } from './CreateTypeForm.types';
type TypeEditor = {
  fields: { name: string; categoryId: string; defaultBaseUnitId: string };
  packages: { name: string; baseQty: string }[];
  creation: { name: string } | null;
};
export function CreateTypeForm(props: CreateTypeFormProps) {
  return (
    <CatalogFormSession<TypeEditor>
      id={'type:' + (props.draftId ?? 'new')}
      defaults={{
        fields: { name: props.initialName ?? '', categoryId: '', defaultBaseUnitId: '' },
        packages: [],
        creation: null,
      }}
    >
      {(session) => <TypeFields {...props} session={session} />}
    </CatalogFormSession>
  );
}
function TypeFields({
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
  const message = useAppErrorMessage();
  const { catalog } = useCatalogModule();
  const cats = useCatalogQuery(['categories'], (port, id, signal) => port.categories(id, signal));
  const units = useCatalogQuery(['units'], (port, _id, signal) => port.units(signal));
  const form = useLocalizedAppForm({
    schema: s.object({
      name: rules.requiredText(t('name'), 120),
      categoryId: s.string(),
      defaultBaseUnitId: rules.required(t('baseUnit')),
    }),
    defaultValues: session.initial.fields,
  });
  const [packages, setPackages] = useState(session.initial.packages);
  const [newCategory, setNewCategory] = useState(session.initial.creation);
  const [packageError, setPackageError] = useState(false);
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
    ) =>
      catalog.createType(
        store.id,
        { ...value, categoryId: value.categoryId || null, defaultPackagings: value.defaultPackagings },
        operationId,
      ),
    (created) => {
      void session.clear().then(
        () => onCreated(created),
        () => onCreated(created),
      );
    },
  );
  const snapshot: TypeEditor = {
    fields: {
      name: form.watch('name'),
      categoryId: form.watch('categoryId'),
      defaultBaseUnitId: form.watch('defaultBaseUnitId'),
    },
    packages,
    creation: newCategory,
  };
  const leave = () => session.leave(snapshot, onCancel);
  const unit = units.data?.find((u) => u.id === form.watch('defaultBaseUnitId'));
  const submit = form.handleSubmit(async (value) => {
    if (!validPackagings(packages, unit?.maxDecimals ?? 3)) {
      setPackageError(true);
      return;
    }
    setPackageError(false);
    await command.submit({ ...value, defaultPackagings: packages });
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
        <Button type="button" block variant="secondary" onClick={leave} disabled={locked || command.unknown}>
          {t('cancel')}
        </Button>
      ) : null}
    </>
  );
  const content = (
    <form id={formId} noValidate onSubmit={submit} className="flex flex-col gap-4">
      <CatalogQueryState
        pending={cats.isPending || units.isPending}
        error={cats.error ?? units.error}
        retry={() => {
          void cats.refetch();
          void units.refetch();
        }}
      />
      <div className="desktop:bg-surface desktop:border-line desktop:grid desktop:grid-cols-3 desktop:rounded-lg desktop:border desktop:p-6 flex flex-col gap-4">
        <form.Field name="name">
          {(field) => <TextField {...field} label={t('name')} required maxLength={120} disabled={locked} />}
        </form.Field>
        <form.Field name="categoryId">
          {(field) => (
            <SelectField
              {...field}
              label={t('group')}
              optional
              createAction={{ label: t('newCategory'), onSelect: (name) => setNewCategory({ name }) }}
              options={[
                { value: '', label: t('noCategory') },
                ...flattenCategories(cats.data ?? []).map((c) => ({ value: c.id, label: c.name })),
              ]}
              disabled={locked || !cats.data}
            />
          )}
        </form.Field>
        <TextField label={t('suggestedAttribute')} disabled hint={t('notReleased')} />
        <div
          aria-hidden="true"
          className="border-line desktop:col-span-3 desktop:block desktop:border-t hidden"
        />
        <form.Field name="defaultBaseUnitId">
          {(field) => (
            <SelectField
              {...field}
              label={t('baseUnit')}
              required
              options={(units.data ?? []).map((u) => ({ value: u.id, label: u.name }))}
              disabled={locked || !units.data}
            />
          )}
        </form.Field>
        <p className="text-body-m text-fg-secondary desktop:col-span-2">{t('unitHint')}</p>
      </div>
      {packages.map((p, i) => (
        <div
          key={i}
          className="bg-surface border-line desktop:flex-row flex flex-col gap-3 rounded-md border p-4"
        >
          <TextField
            label={t('packageName')}
            value={p.name}
            maxLength={80}
            disabled={locked}
            onChange={(name) =>
              setPackages((rows) => rows.map((row, index) => (index === i ? { ...row, name } : row)))
            }
          />
          <DecimalField
            label={t('baseQty')}
            value={p.baseQty}
            maxDecimals={Math.min(3, unit?.maxDecimals ?? 3)}
            disabled={locked}
            onChange={(baseQty) =>
              setPackages((rows) => rows.map((row, index) => (index === i ? { ...row, baseQty } : row)))
            }
          />
          <Button
            variant="secondary"
            type="button"
            disabled={locked}
            onClick={() => setPackages((rows) => rows.filter((_, index) => index !== i))}
          >
            {t('remove')}
          </Button>
        </div>
      ))}
      {packageError ? <Alert tone="danger" title={t('packagings')} /> : null}
      <Button
        type="button"
        variant="secondary"
        disabled={packages.length >= 10 || locked}
        onClick={() => setPackages((rows) => [...rows, { name: '', baseQty: '' }])}
      >
        {t('addPackage')}
      </Button>
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
      {newCategory ? (
        <CreateCategoryForm
          draftId={draftId}
          initialName={newCategory.name}
          categories={cats.data ?? []}
          onCancel={() => setNewCategory(null)}
          onCreated={(category) => {
            form.setValue('categoryId', category.id);
            setNewCategory(null);
            void cats.refetch();
          }}
          present={(body, categoryActions, onLeave) => (
            <FormScene
              open
              title={t('newCategory')}
              onOpenChange={(open) => {
                if (!open) onLeave();
              }}
              actions={categoryActions}
            >
              {body}
            </FormScene>
          )}
        />
      ) : null}
    </>
  );
}
