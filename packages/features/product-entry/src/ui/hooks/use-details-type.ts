'use client';
import { useEffect } from 'react';
import { useFieldValue } from '@dukani/forms';
import type { AttributeEditorValues } from '../../domain/attribute-values.types';
import { BRAND_UNKNOWN } from '../components/NewItemDetails.constants';
import type { DetailsForm } from '../components/NewItemDetails.types';
import { useProductType } from './use-product-type';
import { useTypeSelection } from './use-type-selection';

/**
 * The selected product type and its switching: a new type keeps compatible attribute values, falls back to its
 * default base unit when the current one is not allowed, and the default unit is suggested until one is chosen.
 */
export function useDetailsType(
  form: DetailsForm,
  attributes: AttributeEditorValues,
  onSwitched: (kept: AttributeEditorValues) => void,
) {
  const type = useProductType(useFieldValue(form, 'productTypeId'));
  const selection = useTypeSelection(type.data, attributes, (next, kept) => {
    form.setValue('productTypeId', next.id);
    if (!next.allowedUnits.some((u) => u.id === form.getValues().baseUnitId))
      form.setValue('baseUnitId', next.defaultBaseUnit.id);
    if (!form.getValues().brand) form.setValue('brand', BRAND_UNKNOWN);
    onSwitched(kept);
  });
  const defaultUnitId = type.data?.defaultBaseUnit.id;
  useEffect(() => {
    if (defaultUnitId && !form.getValues().baseUnitId) form.setValue('baseUnitId', defaultUnitId);
  }, [defaultUnitId, form]);
  // render order is the schema's `sort`, never the transport order (F06 AC03)
  const attributeSchema = [...(type.data?.attributes ?? [])].sort((a, b) => a.sort - b.sort);
  return { type, selection, attributeSchema };
}
