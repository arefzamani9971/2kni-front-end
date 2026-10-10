'use client';
import { useValidationRules } from '@dukani/forms';
import { useEntryTranslations } from '../i18n/use-entry-translations';

import { decimal } from '@dukani/domain';
import { useLocalizedAppForm as useAppForm } from '@dukani/forms';
import {
  Alert,
  BarcodeField,
  Button,
  ConfirmDialog,
  FormScene,
  FormSection,
  FeatureAction,
  WorkflowStepper,
  useAppErrorMessage,
  ListRow,
  Section,
  SelectField,
  TextField,
} from '@dukani/ui-kit';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { nextStep } from '../../domain/entry-draft';
import { toAttributeEditorValues, validateAttributeValues } from '../../domain/attribute-values';
import type { AttributeEditorValues } from '../../domain/attribute-values.types';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useProductEntryModule } from '../../module';
import { EntryShell } from './EntryShell';
import { AttributeField } from './AttributeField';
import { SimilarItem } from './SimilarItem';
import { useBrands } from '../hooks/use-brands';
import { useProductType } from '../hooks/use-product-type';
import { useProductTypes } from '../hooks/use-product-types';
import { useTitleCheck } from '../hooks/use-title-check';
import { useDebounced } from '@dukani/platform';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import type { Save } from './NewItemDetails.types';
import { BRAND_NONE, BRAND_UNKNOWN } from './NewItemDetails.constants';
import type { CatalogCreationSlots } from './CatalogCreationSlots.types';
import { useTypeSelection } from '../hooks/use-type-selection';
import { BrandSelection } from './BrandSelection';
import { useDetailsDraft } from '../hooks/use-details-draft';
import { schema } from './NewItemDetails.schema';

export function NewItemDetails({
  draft,
  save,
  creators,
}: {
  draft: EntryDraft;
  save: Save;
  creators?: CatalogCreationSlots;
}) {
  const t = useEntryTranslations();

  const go = useEntryNav();
  const { drafts } = useProductEntryModule();
  const { startFromCatalog } = useStartEntry();
  const item = draft.newItem!;
  const validationRules = useValidationRules();
  const form = useAppForm({
    schema: schema(t, validationRules),
    defaultValues: {
      title: item.title,
      productTypeId: item.productTypeId,
      brand:
        item.brandStatus === 'Known' && item.brandId
          ? item.brandId
          : item.brandStatus === 'None'
            ? BRAND_NONE
            : item.productTypeId
              ? BRAND_UNKNOWN
              : '',
      baseUnitId: item.baseUnitId,
      barcode: item.baseBarcode,
      ...draft.detailsEditor?.fields,
    },
  });
  const [attrs, setAttrs] = useState<AttributeEditorValues>(
    () => draft.detailsEditor?.attributes ?? toAttributeEditorValues(item.attributes),
  );
  const [attrErrors, setAttrErrors] = useState<Record<string, boolean>>({});
  const attributeArea = useRef<HTMLDivElement>(null);
  const [attributesOpen, setAttributesOpen] = useState(draft.detailsEditor?.scene === 'attributes');
  const [imagesOpen, setImagesOpen] = useState(false);
  const [more, setMore] = useState(draft.detailsEditor?.expanded ?? false);

  const typeId = form.watch('productTypeId');
  const types = useProductTypes();
  const type = useProductType(typeId);
  const brands = useBrands();
  const errorMessage = useAppErrorMessage();
  const [selectingBrand, setSelectingBrand] = useState(false);
  const [creation, setCreation] = useState<{ kind: 'brand' | 'type'; name: string } | null>(
    draft.detailsEditor?.creation ?? null,
  );
  const [createdBrands, setCreatedBrands] = useState<
    { id: string; name: string; nameEn: null; status: 'Private' }[]
  >([]);
  const selection = useTypeSelection(type.data, attrs, (next, kept) => {
    form.setValue('productTypeId', next.id);
    if (!next.allowedUnits.some((u) => u.id === form.getValues().baseUnitId))
      form.setValue('baseUnitId', next.defaultBaseUnit.id);
    if (!form.getValues().brand) form.setValue('brand', BRAND_UNKNOWN);
    setAttrs(kept);
    setAttrErrors({});
  });
  const availableBrands = [
    ...(brands.data ?? []),
    ...createdBrands.filter((b) => !brands.data?.some((existing) => existing.id === b.id)),
  ];
  const editor = useDetailsDraft(
    {
      schemaVersion: type.data?.schemaVersion ?? draft.detailsEditor?.schemaVersion ?? null,
      fields: {
        title: form.watch('title'),
        productTypeId: form.watch('productTypeId'),
        brand: form.watch('brand'),
        baseUnitId: form.watch('baseUnitId'),
        barcode: form.watch('barcode') ?? '',
      },
      attributes: attrs,
      expanded: more,
      creation,
      scene: attributesOpen ? 'attributes' : 'main',
    },
    save,
  );
  const openCreation = async (kind: 'brand' | 'type', name: string) => {
    if (await editor.persist()) setCreation({ kind, name });
  };
  const title = useDebounced(form.watch('title'), 500);
  const check = useTitleCheck(title);

  // the type's default base unit is the suggestion until the seller picks another one
  const defaultUnitId = type.data?.defaultBaseUnit.id;
  useEffect(() => {
    if (defaultUnitId && !form.getValues().baseUnitId) form.setValue('baseUnitId', defaultUnitId);
  }, [defaultUnitId, form]);

  // render order is the schema's `sort`, never the transport order (F06 AC03)
  const attributes = [...(type.data?.attributes ?? [])].sort((a, b) => a.sort - b.sort);
  const shown = attributes.filter((a) => a.isRequired || more);
  const unit = type.data?.allowedUnits.find((u) => u.id === form.watch('baseUnitId'));

  const submit = (event: FormEvent<HTMLFormElement>) => form.handleSubmit(async (v) => {
    if (!type.data || type.isPending || type.isError) return;
    if (!attributesOpen) {
      setAttributesOpen(true);
      setMore(true);
      return;
    }
    // an archived option the item already had stays valid until the seller changes it (F06-S14)
    const validated = validateAttributeValues(attributes, attrs, toAttributeEditorValues(item.attributes));
    if (validated.invalidIds.length) {
      setMore(true);
      setAttrErrors(Object.fromEntries(validated.invalidIds.map((id) => [id, true])));
      requestAnimationFrame(() => {
        const group = Array.from(
          attributeArea.current?.querySelectorAll<HTMLElement>('[data-attribute-id]') ?? [],
        ).find((node) => node.dataset.attributeId === validated.invalidIds[0]);
        group?.querySelector<HTMLElement>('input,button,select,textarea')?.focus();
      });
      return;
    }
    if (check.data && !check.data.isAvailable) {
      form.setFieldError('title', t('duplicateTitleHint'));
      return;
    }
    const productType = type.data!;
    const u = productType.allowedUnits.find((x) => x.id === v.baseUnitId) ?? productType.defaultBaseUnit;
    const brand = availableBrands.find((b) => b.id === v.brand);
    if (!brand && v.brand !== BRAND_NONE && v.brand !== BRAND_UNKNOWN) {
      form.setFieldError('brand', t('selectBrand'));
      return;
    }
    const values = validated.values;
    const d = await save((x) => ({
      ...x,
      newItem: {
        ...x.newItem!,
        title: v.title,
        productTypeId: productType.id,
        productTypeName: productType.name,
        brandStatus: brand ? 'Known' : v.brand === BRAND_NONE ? 'None' : 'Unknown',
        brandId: brand?.id ?? null,
        brandName: brand?.name ?? null,
        baseUnitId: u.id,
        baseUnitName: u.name,
        baseUnitMaxDecimals: u.maxDecimals,
        baseBarcode: v.barcode ?? '',
        attributes: values,
        // first visit: suggest the type's default packagings on the units step
        packagings:
          x.newItem?.productTypeId === productType.id && x.newItem.packagings.length
            ? x.newItem.packagings
            : productType.defaultPackagings.map((p) => ({ name: p.name, baseQty: decimal.of(p.baseQty) })),
      },
    }));
    if (d) go.step(d.id, nextStep(d, 'details'));
  })(event);

  const similar = check.data?.similarItems ?? [];
  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        breadcrumb={t('entryBreadcrumb')}
        title={attributesOpen ? t('attributesTitle', { name: type.data?.name ?? '' }) : t('newProduct')}
        back={() => {
          if (attributesOpen) setAttributesOpen(false);
          else
            void editor.persist().then((saved) => {
              if (saved) go.back();
            });
        }}
        actions={
          <>
            <Button
              type="submit"
              block
              loading={form.formState.isSubmitting}
              disabled={!type.data || type.isPending || !!type.error || selection.busy}
            >
              {attributesOpen ? t('reviewContinue') : t('productAttributes')}
            </Button>
          </>
        }
      >
        <div className="desktop:block hidden">
          <WorkflowStepper
            steps={[t('detailsStep'), t('unitsPacks'), t('salePrice')]}
            current={0}
            label={t('newProduct')}
          />
        </div>
        {editor.failed ? (
          <Alert
            tone="danger"
            title={t('draftSaveFailed')}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  void editor.persist();
                }}
              >
                {t('retry')}
              </Button>
            }
          />
        ) : null}
        {type.error || selection.error ? (
          <Alert
            tone="danger"
            title={errorMessage((type.error ?? selection.error)!)}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  if (selection.error) selection.retry();
                  else void type.refetch();
                }}
              >
                {t('retry')}
              </Button>
            }
          />
        ) : null}
        {!attributesOpen ? (
          <>
            <Section title={t('mainDetails')}>
              <div className="desktop:grid-cols-3 grid gap-4">
                <form.Field name="title">
                  {(f) => (
                    <TextField
                      {...f}
                      label={t('distinctName')}
                      required
                      maxLength={250}
                      placeholder={t('nameExample')}
                    />
                  )}
                </form.Field>
                {similar.length > 0 ? (
                  <Alert
                    tone={check.data?.isAvailable ? 'warning' : 'danger'}
                    title={check.data?.isAvailable ? t('similarCatalog') : t('titleExists')}
                    description={
                      <div className="flex flex-col gap-2">
                        <span>{t('selectExistingHint')}</span>
                        {similar.slice(0, 3).map((it) => (
                          <SimilarItem
                            key={it.id}
                            item={it}
                            onPick={async () => {
                              await startFromCatalog(it.id, it.myStoreProductId ?? null);
                              await drafts.remove(go.storeId, draft.id);
                            }}
                          />
                        ))}
                      </div>
                    }
                  />
                ) : null}
                <form.Field name="productTypeId">
                  {(f) => (
                    <SelectField
                      {...f}
                      label={t('productType')}
                      required
                      searchable
                      placeholder={types.isPending ? t('loading') : t('chooseType')}
                      options={(types.data ?? []).map((t) => ({
                        value: t.id,
                        label: t.name,
                        description: t.categoryName ?? undefined,
                      }))}
                      disabled={selection.busy}
                      onChange={(v) => {
                        void selection.select(v);
                      }}
                      createAction={
                        creators?.type
                          ? {
                              label: t('createType'),
                              onSelect: (name) => {
                                void openCreation('type', name);
                              },
                            }
                          : undefined
                      }
                    />
                  )}
                </form.Field>
                <form.Field name="brand">
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <span className="text-body-s text-fg-secondary">{t('brand')}</span>
                      <Button
                        type="button"
                        block
                        variant="secondary"
                        onClick={() => {
                          void editor.persist().then((saved) => {
                            if (saved) setSelectingBrand(true);
                          });
                        }}
                      >
                        {availableBrands.find((brand) => brand.id === field.value)?.name ??
                          (field.value === BRAND_NONE
                            ? t('unbranded')
                            : field.value === BRAND_UNKNOWN
                              ? t('unknownBrand')
                              : t('selectBrand'))}
                      </Button>
                      {field.message ? (
                        <p role="alert" className="text-body-s text-danger">
                          {field.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                </form.Field>
                <form.Field name="baseUnitId">
                  {(f) => (
                    <SelectField
                      {...f}
                      label={t('baseSalesUnit')}
                      required
                      disabled={!type.data}
                      placeholder={typeId ? t('chooseUnit') : t('chooseTypeFirst')}
                      options={(type.data?.allowedUnits ?? []).map((u) => ({
                        value: u.id,
                        label: `${u.name}${u.id === type.data?.defaultBaseUnit.id ? t('suggestedType') : ''}`,
                      }))}
                      hint={unit && unit.maxDecimals > 0 ? t('decimalUnitHint') : undefined}
                    />
                  )}
                </form.Field>
              </div>
            </Section>
            <Section title={t('barcode')}>
              <form.Field name="barcode">
                {(f) => <BarcodeField {...f} label={t('manufacturerBarcode')} optional />}
              </form.Field>
              <ListRow>{t('hasBarcode')}</ListRow>
              <ListRow>{t('internalBarcodeHint')}</ListRow>
            </Section>
            <Section title={t('publication')}>
              <ListRow>{t('privateImmediately')}</ListRow>
              <ListRow>{t('adminApproval')}</ListRow>
            </Section>
          </>
        ) : (
          <div ref={attributeArea} className="desktop:grid-cols-3 grid gap-6">
            <FormSection title={t('additionalAttributes')} className="desktop:col-span-2">
              <div className="desktop:grid-cols-2 grid gap-4">
                {' '}
                {shown.map((a) => (
                  <div key={a.attributeId} data-attribute-id={a.attributeId}>
                    <AttributeField
                      attribute={a}
                      value={attrs[a.attributeId] ?? ''}
                      error={attrErrors[a.attributeId] ? t('chooseAttribute', { name: a.name }) : undefined}
                      onChange={(v) => {
                        setAttrs((x) => ({ ...x, [a.attributeId]: v }));
                        setAttrErrors((x) => ({ ...x, [a.attributeId]: false }));
                      }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-body-s text-fg-tertiary">{t('attributesHint')}</p>
            </FormSection>
            <aside className="flex flex-col gap-4">
              <FeatureAction
                kind="brand"
                label={t('selectOrCreateBrand')}
                onClick={() => setSelectingBrand(true)}
              />
              <FeatureAction kind="image" label={t('optionalImages')} onClick={() => setImagesOpen(true)} />
            </aside>
          </div>
        )}
      </EntryShell>
      <FormScene open={imagesOpen} onOpenChange={setImagesOpen} title={t('optionalImages')}>
        <p className="text-body-m text-fg-secondary">{t('imagesContextHint')}</p>
        <p>{t('imageCount', { count: item.imageFileIds?.length ?? 0 })}</p>
      </FormScene>
      {selectingBrand ? (
        <BrandSelection
          value={form.watch('brand')}
          brands={availableBrands}
          pending={brands.isPending}
          error={brands.error}
          retry={() => {
            void brands.refetch();
          }}
          onCancel={() => setSelectingBrand(false)}
          onSelect={(value) => {
            form.setValue('brand', value);
            setSelectingBrand(false);
          }}
          onCreate={
            creators?.brand
              ? (name) => {
                  setSelectingBrand(false);
                  void openCreation('brand', name);
                }
              : undefined
          }
        />
      ) : null}
      <ConfirmDialog
        open={selection.pending}
        onOpenChange={(open) => {
          if (!open) selection.cancel();
        }}
        title={t('typeChangeTitle')}
        description={t('typeChangeHint')}
        confirmLabel={t('confirmTypeChange')}
        onConfirm={selection.confirm}
      >
        <ul>
          {selection.removedNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </ConfirmDialog>
      {creation?.kind === 'brand'
        ? creators?.brand?.({
            draftId: draft.id,
            initialName: creation.name,
            present: (content, actions, onLeave) => (
              <FormScene
                open
                onOpenChange={(open) => {
                  if (!open) onLeave();
                }}
                title={t('createBrand')}
                actions={actions}
              >
                {content}
              </FormScene>
            ),
            onCancel: () => setCreation(null),
            onCreated: (brand) => {
              setCreatedBrands((rows) => [...rows, { ...brand, nameEn: null, status: 'Private' }]);
              form.setValue('brand', brand.id);
              setCreation(null);
            },
          })
        : creation
          ? creators?.type?.({
              draftId: draft.id,
              initialName: creation.name,
              present: (content, actions, onLeave) => (
                <FormScene
                  open
                  onOpenChange={(open) => {
                    if (!open) onLeave();
                  }}
                  title={t('createType')}
                  actions={actions}
                >
                  {content}
                </FormScene>
              ),
              onCancel: () => setCreation(null),
              onCreated: (next) => {
                setCreation(null);
                void selection.select(next.id);
              },
            })
          : null}
    </form>
  );
}
