'use client';
import type { FormEvent, RefObject } from 'react';
import type { Dto } from '@dukani/contracts';
import { toAttributeEditorValues, validateAttributeValues } from '../../../domain/attribute-values';
import type { AttributeEditorValues } from '../../../domain/attribute-values.types';
import { applyDetails, parseNetContent } from '../../../domain/entry-details';
import { nextStep } from '../../../domain/entry-draft';
import type { EntryDraft } from '../../../domain/entry-draft.types';
import { useProductEntryModule } from '../../../module';
import { BRAND_NONE, BRAND_UNKNOWN } from '../constants/NewItemDetails.constants';
import type { DetailsForm } from '../types/NewItemDetails.types';
import type { Save } from '../../common/types/use-entry-draft.types';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import type { useDetailsScene } from './use-details-scene';

/**
 * The details step submit: images uploaded → attributes shown and valid → title free → brand, net content →
 * draft. Each failed gate keeps the input and points at the field (or attribute) to fix.
 */
export function useDetailsSubmit(options: {
  readonly form: DetailsForm;
  readonly draft: EntryDraft;
  readonly productType: Dto<'ProductTypeDto'> | undefined;
  readonly typeReady: boolean;
  readonly attributes: readonly Dto<'ProductTypeAttributeDto'>[];
  readonly attributeValues: AttributeEditorValues;
  readonly attributeArea: RefObject<HTMLDivElement | null>;
  /** Kept by the title leaf; read at submit time so typing the title renders nothing here. */
  readonly titleAvailable: { readonly current: boolean };
  readonly brands: readonly { readonly id: string; readonly name: string }[];
  readonly contentUnitIds: readonly string[];
  readonly scene: ReturnType<typeof useDetailsScene>;
  readonly save: Save;
}) {
  const t = useEntryTranslations();
  const go = useEntryNav();
  const { analytics } = useProductEntryModule();
  const { form, draft, productType, scene } = options;
  const item = draft.newItem!;

  const focusAttribute = (id: string) =>
    requestAnimationFrame(() => {
      const group = Array.from(
        options.attributeArea.current?.querySelectorAll<HTMLElement>('[data-attribute-id]') ?? [],
      ).find((node) => node.dataset.attributeId === id);
      group?.querySelector<HTMLElement>('input,button,select,textarea')?.focus();
    });

  return (event: FormEvent<HTMLFormElement>) =>
    form.handleSubmit(async (values) => {
      if (item.images?.some((image) => !image.fileId)) return scene.openImages();
      if (!productType || !options.typeReady) return;
      if (!scene.attributesOpen && draft.intent !== 'standalone') return scene.openAttributes();
      // an archived option the item already had stays valid until the seller changes it (F06-S14)
      const validated = validateAttributeValues(
        options.attributes,
        options.attributeValues,
        toAttributeEditorValues(item.attributes),
      );
      if (validated.invalidIds.length) {
        analytics.track({ eventName: 'validation_failed', flowId: 'F10', errorCode: 'ATTRIBUTE_REQUIRED' });
        scene.markInvalid(validated.invalidIds);
        focusAttribute(validated.invalidIds[0]!);
        return;
      }
      if (!options.titleAvailable.current) return form.setFieldError('title', t('duplicateTitleHint'));
      const brand = options.brands.find((b) => b.id === values.brand) ?? null;
      if (!brand && values.brand !== BRAND_NONE && values.brand !== BRAND_UNKNOWN)
        return form.setFieldError('brand', t('selectBrand'));
      const netContent = parseNetContent(
        values.netContentValue,
        values.netContentUnitId,
        options.contentUnitIds,
      );
      if (!netContent.ok) return form.setFieldError(netContent.field, t('netContentInvalid'));
      const saved = await options.save((d) =>
        applyDetails(d, {
          values,
          productType,
          brand,
          brandStatus: brand ? 'Known' : values.brand === BRAND_NONE ? 'None' : 'Unknown',
          attributes: validated.values,
          netContent,
        }),
      );
      if (saved) go.step(saved.id, nextStep(saved, 'details'));
    })(event);
}
