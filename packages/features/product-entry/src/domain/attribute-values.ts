import { decimal, parseDecimalInput } from '@dukani/domain';
import type { AttributeValue } from './entry-draft.types';
import type {
  AttributeEditorValues,
  AttributeSchemaField,
  AttributeValidation,
} from './attribute-values.types';

export const toAttributeEditorValues = (values: readonly AttributeValue[]): AttributeEditorValues =>
  Object.fromEntries(
    values.map((a) => [
      a.attributeId,
      a.optionIds ?? a.text ?? a.number ?? (a.bool === undefined ? '' : String(a.bool)),
    ]),
  );

/** No truthiness check: zero and false are real values; absent optional values are omitted. */
export function validateAttributeValues(
  schema: readonly AttributeSchemaField[],
  raw: AttributeEditorValues,
  historical: AttributeEditorValues = {},
): AttributeValidation {
  const values: AttributeValue[] = [];
  const invalidIds: string[] = [];
  for (const field of schema) {
    const value = raw[field.attributeId];
    const absent =
      value === undefined || (typeof value === 'string' ? value.trim() === '' : value.length === 0);
    if (absent) {
      if (field.isRequired) invalidIds.push(field.attributeId);
      continue;
    }
    const id = field.attributeId;
    if (field.dataType === 'Option' || field.dataType === 'MultiOption') {
      const ids = typeof value === 'string' ? [value] : [...value!];
      if (
        ids.length > 30 ||
        new Set(ids).size !== ids.length ||
        (field.dataType === 'Option' && ids.length !== 1) ||
        ids.some(
          (optionId) =>
            !field.options.some(
              (o) =>
                o.id === optionId &&
                (!o.isArchived ||
                  (typeof historical[id] === 'string'
                    ? historical[id] === optionId
                    : historical[id]?.includes(optionId))),
            ),
        )
      )
        invalidIds.push(id);
      else values.push({ attributeId: id, optionIds: ids });
    } else if (typeof value !== 'string') invalidIds.push(id);
    else if (field.dataType === 'Number') {
      const parsed = parseDecimalInput(value, { allowNegative: true });
      if (
        !parsed.ok ||
        decimal.lt(parsed.value, decimal.of('-1000000000')) ||
        decimal.gt(parsed.value, decimal.of('1000000000'))
      )
        invalidIds.push(id);
      else values.push({ attributeId: id, number: parsed.value });
    } else if (field.dataType === 'Bool') {
      if (value !== 'true' && value !== 'false') invalidIds.push(id);
      else values.push({ attributeId: id, bool: value === 'true' });
    } else if (value.trim().length > 250) invalidIds.push(id);
    else values.push({ attributeId: id, text: value.trim() });
  }
  return { values, invalidIds };
}

/** Compatible identities survive schema changes; the caller confirms any populated discarded fields. */
export function reconcileAttributeValues(
  previous: readonly AttributeSchemaField[],
  next: readonly AttributeSchemaField[],
  values: AttributeEditorValues,
) {
  const kept: Record<string, string | readonly string[]> = {};
  const removed: string[] = [];
  for (const [id, value] of Object.entries(values)) {
    const before = previous.find((a) => a.attributeId === id);
    const after = next.find((a) => a.attributeId === id);
    if (before && after && before.dataType === after.dataType) kept[id] = value;
    else if (typeof value === 'string' ? value.trim() !== '' : value.length > 0) removed.push(id);
  }
  return { kept, removed };
}
