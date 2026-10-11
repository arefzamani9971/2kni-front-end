'use client';
import { useEffect, useRef, useState } from 'react';
import { useDebounced } from '@dukani/platform';
import { Button, WorkflowStepper } from '@dukani/ui-kit';
import { toAttributeEditorValues } from '../../domain/attribute-values';
import type { AttributeEditorValues } from '../../domain/attribute-values.types';
import { switchKind } from '../../domain/entry-details';
import type { EntryDraft } from '../../domain/entry-draft.types';
import { useProductEntryModule } from '../../module';
import { useBrandChoices } from '../hooks/use-brand-choices';
import { useDetailsAutosave } from '../hooks/use-details-autosave';
import { useDetailsForm } from '../hooks/use-details-form';
import { useDetailsScene } from '../hooks/use-details-scene';
import { useDetailsSubmit } from '../hooks/use-details-submit';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useProductTypes } from '../hooks/use-product-types';
import { useStartEntry } from '../hooks/use-start-entry';
import { useTitleCheck } from '../hooks/use-title-check';
import { useDetailsType } from '../hooks/use-details-type';
import { useContentUnits } from '../hooks/use-content-units';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { BrandSelection } from './BrandSelection';
import { CatalogCreationScene } from './CatalogCreationScene';
import type { CatalogCreationSlots } from './CatalogCreationSlots.types';
import { DetailsAttributes } from './DetailsAttributes';
import { DetailsBarcodeSection } from './DetailsBarcodeSection';
import { DetailsLocalSection } from './DetailsLocalSection';
import { DetailsMainSection } from './DetailsMainSection';
import { DetailsPublicationSection } from './DetailsPublicationSection';
import { DetailsStatusAlerts } from './DetailsStatusAlerts';
import { EntryImages } from './EntryImages';
import { EntryKindSection } from './EntryKindSection';
import { EntryShell } from './EntryShell';
import type { DetailsCreation, Save } from './NewItemDetails.types';
import { TypeChangeDialog } from './TypeChangeDialog';

/** New catalog item details (F10 manual + attributes): composes the form, its sections and in-place creation. */
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
  const { drafts, analytics } = useProductEntryModule();
  useEffect(() => analytics.track({ eventName: 'screen_view', flowId: 'F10' }), [analytics]);
  const { startFromCatalog } = useStartEntry();
  const item = draft.newItem!;
  const service = item.kind === 'Service';
  const form = useDetailsForm(draft);
  const scene = useDetailsScene(draft);
  const attributeArea = useRef<HTMLDivElement>(null);
  const [attrs, setAttrs] = useState<AttributeEditorValues>(
    () => draft.detailsEditor?.attributes ?? toAttributeEditorValues(item.attributes),
  );
  const [selectingBrand, setSelectingBrand] = useState(false);
  const [creation, setCreation] = useState<DetailsCreation | null>(draft.detailsEditor?.creation ?? null);

  const types = useProductTypes();
  const brands = useBrandChoices();
  const { units: contentUnits, error: unitsError } = useContentUnits();
  const check = useTitleCheck(useDebounced(form.watch('title'), 500));
  const {
    type,
    selection,
    attributeSchema: attributes,
  } = useDetailsType(form, attrs, (kept) => {
    setAttrs(kept);
    scene.clearErrors();
  });
  const editor = useDetailsAutosave({
    form,
    draft,
    schemaVersion: type.data?.schemaVersion,
    attributes: attrs,
    expanded: scene.expanded,
    creation,
    scene: scene.scene,
    save,
  });
  const openCreation = async (kind: DetailsCreation['kind'], name: string) => {
    if (await editor.persist()) setCreation({ kind, name });
  };
  const chooseBrand = () => {
    void editor.persist().then((saved) => {
      if (saved) setSelectingBrand(true);
    });
  };

  const submit = useDetailsSubmit({
    form,
    draft,
    productType: type.data,
    typeReady: !type.isPending && !type.isError,
    attributes,
    attributeValues: attrs,
    attributeArea,
    titleAvailable: !(check.data && !check.data.isAvailable),
    brands: brands.available,
    contentUnitIds: contentUnits.map((u) => u.id),
    scene,
    save,
  });

  if (scene.scene === 'images') return <EntryImages draft={draft} save={save} onClose={scene.closeImages} />;
  return (
    <form noValidate onSubmit={submit} className="contents">
      <EntryShell
        breadcrumb={t('entryBreadcrumb')}
        title={scene.attributesOpen ? t('attributesTitle', { name: type.data?.name ?? '' }) : t('newProduct')}
        back={() => {
          if (scene.attributesOpen) scene.closeAttributes();
          else
            void editor.persist().then((saved) => {
              if (saved) go.back();
            });
        }}
        actions={
          <Button
            type="submit"
            block
            loading={form.formState.isSubmitting}
            disabled={!type.data || type.isPending || !!type.error || selection.busy}
          >
            {scene.attributesOpen ? t('reviewContinue') : t('productAttributes')}
          </Button>
        }
      >
        <div className="desktop:block hidden">
          <WorkflowStepper
            steps={[t('detailsStep'), t('unitsPacks'), t('salePrice')]}
            current={0}
            label={t('newProduct')}
          />
        </div>
        <DetailsStatusAlerts
          draftFailed={editor.failed}
          onRetryDraft={() => void editor.persist()}
          schemaError={type.error ?? selection.error}
          onRetrySchema={() => (selection.error ? selection.retry() : void type.refetch())}
        />
        {!scene.attributesOpen ? (
          <>
            <DetailsMainSection
              form={form}
              types={types.data ?? []}
              typesPending={types.isPending}
              productType={type.data}
              selectionBusy={selection.busy}
              brands={brands.available}
              titleCheck={check.data}
              onSelectType={(id) => void selection.select(id)}
              onCreateType={creators?.type ? (name) => void openCreation('type', name) : undefined}
              onChooseBrand={chooseBrand}
              onPickSimilar={async (similar) => {
                await startFromCatalog(similar.id, similar.myStoreProductId ?? null);
                await drafts.remove(go.storeId, draft.id);
              }}
            />
            <EntryKindSection
              kind={item.kind ?? 'Goods'}
              onChange={(kind) => {
                form.setValue('barcode', '');
                form.setValue('netContentValue', '');
                form.setValue('netContentUnitId', '');
                void save((d) => switchKind(d, kind));
              }}
            />
            {!service ? <DetailsBarcodeSection form={form} /> : null}
            <DetailsPublicationSection
              form={form}
              service={service}
              contentUnits={contentUnits}
              unitsError={unitsError}
              submitForPublicReview={item.submitForPublicReview ?? false}
              onPublicReviewChange={(submitForPublicReview) =>
                void save((d) => ({ ...d, newItem: { ...d.newItem!, submitForPublicReview } }))
              }
            />
            <DetailsLocalSection form={form} service={service} />
          </>
        ) : (
          <DetailsAttributes
            area={attributeArea}
            attributes={attributes.filter((a) => a.isRequired || scene.expanded)}
            values={attrs}
            errors={scene.attributeErrors}
            onChange={(id, value) => {
              setAttrs((current) => ({ ...current, [id]: value }));
              scene.clearError(id);
            }}
            onChooseBrand={() => setSelectingBrand(true)}
            onOpenImages={scene.openImages}
          />
        )}
      </EntryShell>
      {selectingBrand ? (
        <BrandSelection
          value={form.watch('brand')}
          brands={brands.available}
          pending={brands.query.isPending}
          error={brands.query.error}
          retry={() => void brands.query.refetch()}
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
      <TypeChangeDialog
        open={selection.pending}
        removedNames={selection.removedNames}
        onConfirm={selection.confirm}
        onCancel={selection.cancel}
      />
      {creation ? (
        <CatalogCreationScene
          creation={creation}
          creators={creators}
          draftId={draft.id}
          onCancel={() => setCreation(null)}
          onBrandCreated={(brand) => {
            brands.addCreated(brand);
            form.setValue('brand', brand.id);
            setCreation(null);
          }}
          onTypeCreated={(next) => {
            setCreation(null);
            void selection.select(next.id);
          }}
        />
      ) : null}
    </form>
  );
}
