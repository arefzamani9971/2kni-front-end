'use client';
import type { RefObject } from 'react';
import type { Dto } from '@dukani/contracts';
import { FeatureAction, FormSection } from '@dukani/ui-kit';
import type { AttributeEditorValue, AttributeEditorValues } from '../../domain/attribute-values.types';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { AttributeField } from './AttributeField';

/** Attributes of the selected type in schema order, with brand and image shortcuts beside them. */
export function DetailsAttributes({
  area,
  attributes,
  values,
  errors,
  onChange,
  onChooseBrand,
  onOpenImages,
}: {
  area: RefObject<HTMLDivElement | null>;
  attributes: readonly Dto<'ProductTypeAttributeDto'>[];
  values: AttributeEditorValues;
  errors: Readonly<Record<string, boolean>>;
  onChange: (attributeId: string, value: AttributeEditorValue) => void;
  onChooseBrand: () => void;
  onOpenImages: () => void;
}) {
  const t = useEntryTranslations();
  return (
    <div ref={area} className="desktop:grid-cols-3 grid gap-6">
      <FormSection title={t('additionalAttributes')} className="desktop:col-span-2">
        <div className="desktop:grid-cols-2 grid gap-4">
          {attributes.map((a) => (
            <div key={a.attributeId} data-attribute-id={a.attributeId}>
              <AttributeField
                attribute={a}
                value={values[a.attributeId] ?? ''}
                error={errors[a.attributeId] ? t('chooseAttribute', { name: a.name }) : undefined}
                onChange={(v) => onChange(a.attributeId, v)}
              />
            </div>
          ))}
        </div>
        <p className="text-body-s text-fg-tertiary">{t('attributesHint')}</p>
      </FormSection>
      <aside className="flex flex-col gap-4">
        <FeatureAction kind="brand" label={t('selectOrCreateBrand')} onClick={onChooseBrand} />
        <FeatureAction kind="image" label={t('optionalImages')} onClick={onOpenImages} />
      </aside>
    </div>
  );
}
