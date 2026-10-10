import { describe, expect, it } from 'vitest';
import { decimal } from '@dukani/domain';
import {
  reconcileAttributeValues,
  toAttributeEditorValues,
  validateAttributeValues,
} from './attribute-values';
import type { AttributeSchemaField } from './attribute-values.types';
const field = (dataType: AttributeSchemaField['dataType'], isRequired = true): AttributeSchemaField => ({
  attributeId: 'a',
  dataType,
  isRequired,
  options: ['1', '2', '3'].map((id) => ({ id, isArchived: false })),
});
describe('F06 schema-driven values', () => {
  it('roundtrips all selected options and accepts false and zero', () => {
    expect(toAttributeEditorValues([{ attributeId: 'a', optionIds: ['1', '2', '3'] }]).a).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(
      validateAttributeValues([field('MultiOption')], { a: ['1', '2', '3'] }).values[0]?.optionIds,
    ).toEqual(['1', '2', '3']);
    expect(validateAttributeValues([field('Bool')], { a: 'false' }).values[0]?.bool).toBe(false);
    expect(validateAttributeValues([field('Number')], { a: '۰' }).values[0]?.number).toBe(decimal.zero);
  });
  it('rejects duplicate/foreign options and invalid branch shapes', () => {
    for (const value of [['1', '1'], ['foreign'], ['1', '2']])
      expect(validateAttributeValues([field('Option')], { a: value }).invalidIds).toEqual(['a']);
    expect(validateAttributeValues([field('MultiOption')], { a: ['1', '1'] }).invalidIds).toEqual(['a']);
    expect(validateAttributeValues([field('Bool')], { a: 'other' }).invalidIds).toEqual(['a']);
  });
  it('enforces text and numeric bounds and allows absent optional values', () => {
    expect(validateAttributeValues([field('Text')], { a: 'x'.repeat(250) }).invalidIds).toEqual([]);
    expect(validateAttributeValues([field('Text')], { a: 'x'.repeat(251) }).invalidIds).toEqual(['a']);
    expect(validateAttributeValues([field('Number')], { a: '-1000000000' }).invalidIds).toEqual([]);
    expect(validateAttributeValues([field('Number')], { a: '1000000001' }).invalidIds).toEqual(['a']);
    expect(validateAttributeValues([field('Text', false)], { a: '  ' }).values).toEqual([]);
  });
  it('rejects new archived choices while allowing unchanged historical values', () => {
    const schema = [
      {
        ...field('MultiOption'),
        options: [
          { id: 'old', isArchived: true },
          { id: 'new', isArchived: false },
        ],
      },
    ];
    expect(validateAttributeValues(schema, { a: ['old'] }).invalidIds).toEqual(['a']);
    expect(validateAttributeValues(schema, { a: ['old', 'new'] }, { a: ['old'] }).invalidIds).toEqual([]);
    expect(validateAttributeValues(schema, { a: ['old'] }, { a: ['different'] }).invalidIds).toEqual(['a']);
  });
  it('preserves only compatible attribute identities on type changes', () => {
    expect(reconcileAttributeValues([field('Text')], [field('Text')], { a: 'model' })).toEqual({
      kept: { a: 'model' },
      removed: [],
    });
    expect(reconcileAttributeValues([field('Text')], [field('Number')], { a: 'model' })).toEqual({
      kept: {},
      removed: ['a'],
    });
  });
});
