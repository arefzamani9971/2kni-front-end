'use client';
import { useEffect, useId, useState } from 'react';
import { useActiveStore, useCan } from '@dukani/platform';
import { useLocalizedAppForm, useValidationRules, s } from '@dukani/forms';
import { newUuid } from '@dukani/domain';
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
import { MAX_PACKAGINGS, packagingIssues, type PackagingRowIssue } from '../../domain/packagings';
import { useCatalogModule } from '../../module';
import { flattenCategories } from '../../domain/categories';
import { useCatalogQuery } from '../hooks/use-catalog-query';
import { useCatalogCommand } from '../hooks/use-catalog-command';
import { CreateCategoryForm } from './CreateCategoryForm';
import { DuplicateChoice } from './DuplicateChoice';
import { useDuplicateMatch } from '../hooks/use-duplicate-match';
import { CatalogQueryState } from './CatalogQueryState';
import { useCatalogTexts } from '../i18n/use-catalog-translations';
import { CatalogAutosave, CatalogFormSession, type FormSession } from './CatalogFormSession';
import type { CreateTypeFormProps } from './CreateTypeForm.types';
type PackageRow = { key?: string; name: string; baseQty: string };
type TypeEditor = {
  fields: { name: string; categoryId: string; defaultBaseUnitId: string };
  packages: PackageRow[];
  creation: { name: string } | null;
};
/** Removable rows need identity: with index keys a removal hands the typed text of one row to the next. */
// newUuid uses getRandomValues, which unlike crypto.randomUUID also exists on plain-HTTP origins (LAN device testing)
const withKey = (row: PackageRow): Required<PackageRow> => ({ ...row, key: row.key ?? newUuid() });
const PACKAGE_NAME_ERROR = {
  required: 'packageNameRequired',
  tooLong: 'packageNameTooLong',
  duplicate: 'packageNameDuplicate',
} as const satisfies Record<NonNullable<PackagingRowIssue['name']>, string>;
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
  const [packages, setPackages] = useState(() => session.initial.packages.map(withKey));
  const [newCategory, setNewCategory] = useState(session.initial.creation);
  const [showPackageIssues, setShowPackageIssues] = useState(false);
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
  const issues = packagingIssues(packages, unit?.maxDecimals ?? 3);
  const packagesValid = !issues.tooMany && issues.rows.every((row) => !row.name && !row.baseQty);
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
    if (!packagesValid) {
      setShowPackageIssues(true);
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(`[data-package-form="${formId}"] [aria-invalid="true"]`)?.focus();
      });
      return;
    }
    await command.submit({
      ...value,
      defaultPackagings: packages.map(({ name, baseQty }) => ({ name: name.trim(), baseQty })),
    });
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
    <form id={formId} noValidate onSubmit={submit} data-package-form={formId} className="flex flex-col gap-4">
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
          key={p.key}
          className="bg-surface border-line desktop:flex-row flex flex-col gap-3 rounded-md border p-4"
        >
          <TextField
            label={t('packageName')}
            value={p.name}
            maxLength={80}
            disabled={locked}
            status={showPackageIssues && issues.rows[i]?.name ? 'error' : undefined}
            message={
              showPackageIssues && issues.rows[i]?.name
                ? t(PACKAGE_NAME_ERROR[issues.rows[i]!.name!])
                : undefined
            }
            onChange={(name) =>
              setPackages((rows) => rows.map((row) => (row.key === p.key ? { ...row, name } : row)))
            }
          />
          <DecimalField
            label={t('baseQty')}
            value={p.baseQty}
            maxDecimals={Math.min(3, unit?.maxDecimals ?? 3)}
            disabled={locked}
            status={showPackageIssues && issues.rows[i]?.baseQty ? 'error' : undefined}
            message={showPackageIssues && issues.rows[i]?.baseQty ? t('packageQtyInvalid') : undefined}
            onChange={(baseQty) =>
              setPackages((rows) => rows.map((row) => (row.key === p.key ? { ...row, baseQty } : row)))
            }
          />
          <Button
            variant="secondary"
            type="button"
            disabled={locked}
            onClick={() => setPackages((rows) => rows.filter((row) => row.key !== p.key))}
          >
            {t('remove')}
          </Button>
        </div>
      ))}
      {showPackageIssues && issues.tooMany ? <Alert tone="danger" title={t('packagesTooMany')} /> : null}
      <Button
        type="button"
        variant="secondary"
        disabled={packages.length >= MAX_PACKAGINGS || locked}
        onClick={() => setPackages((rows) => [...rows, withKey({ name: '', baseQty: '' })])}
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
      {duplicate ? (
        <DuplicateChoice
          name={duplicate.name}
          onUse={() => {
            void session.clear().then(
              () => onCreated(duplicate),
              () => onCreated(duplicate),
            );
          }}
        />
      ) : command.error ? (
        <Alert tone="danger" title={message(command.error)} />
      ) : null}
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
