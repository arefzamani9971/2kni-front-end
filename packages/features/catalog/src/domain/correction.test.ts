import type { CorrectionField } from './correction.types';
import {
  correctionActions,
  correctionIssues,
  describeValue,
  emptyCorrectionDraft,
  isOpenCorrection,
  toCorrectionRequest,
  toggleField,
} from './correction';

const field = (
  over: Partial<CorrectionField> & Pick<CorrectionField, 'key' | 'valueType'>,
): CorrectionField => ({
  name: null,
  currentValue: null,
  currentName: null,
  clearable: true,
  maxLength: null,
  allowedValues: [],
  ...over,
});
const title = field({
  key: 'title',
  valueType: 'Text',
  currentValue: 'خودکار بیک آبی',
  clearable: false,
  maxLength: 250,
});
const color = field({
  key: 'attr:color',
  valueType: 'Option',
  name: 'رنگ جوهر',
  currentValue: 'blue',
  clearable: false,
  allowedValues: [
    { value: 'blue', name: 'آبی' },
    { value: 'red', name: 'قرمز' },
  ],
});
const description = field({ key: 'description', valueType: 'LongText', maxLength: 2000 });
const fields = [title, color, description];

describe('catalog correction (F11)', () => {
  it('starts a selected field from its current value and forgets it when unselected', () => {
    const on = toggleField(emptyCorrectionDraft, color, true);
    expect(on).toMatchObject({ selected: ['attr:color'], values: { 'attr:color': 'blue' } });
    expect(toggleField(on, color, false)).toMatchObject({ selected: [], values: {} });
  });

  it('asks for at least one change, a reason and finished uploads', () => {
    const issues = correctionIssues(fields, {
      ...emptyCorrectionDraft,
      evidence: [{ id: 'e', file: new File(['x'], 'a.png') }],
    });
    expect(issues).toEqual([
      { field: 'selection', code: 'NONE' },
      { field: 'reason', code: 'REQUIRED' },
      { field: 'evidence', code: 'UPLOADING' },
    ]);
  });

  it('flags unchanged, required and too long values per field', () => {
    const draft = {
      selected: ['title', 'attr:color', 'description'],
      values: { title: '', 'attr:color': 'blue', description: 'x'.repeat(2001) },
      reason: 'برچسب اشتباه است',
    };
    expect(correctionIssues(fields, draft)).toEqual([
      { field: 'title', code: 'REQUIRED' },
      { field: 'attr:color', code: 'UNCHANGED' },
      { field: 'description', code: 'TOO_LONG' },
    ]);
  });

  it('sends only selected server keys, trimmed, with an empty value as a clear', () => {
    const request = toCorrectionRequest(fields, {
      selected: ['attr:color', 'description', 'invented'],
      values: { 'attr:color': 'red', description: '  ', invented: 'x' },
      reason: ' دلیل ',
      evidence: [{ id: 'e', file: new File(['x'], 'a.png'), fileId: 'f1' }],
    });
    expect(request).toEqual({
      proposedChanges: { 'attr:color': 'red', description: null },
      reason: 'دلیل',
      evidenceFileIds: ['f1'],
    });
  });

  it('shows option keys by their names and keeps the server status rules', () => {
    expect(describeValue(color, 'red')).toBe('قرمز');
    expect(describeValue(undefined, 'raw')).toBe('raw');
    expect(describeValue(title, null)).toBeNull();
    expect(correctionActions('NeedInfo')).toEqual({ reply: true, appeal: false, withdraw: true });
    expect(correctionActions('Rejected')).toEqual({ reply: false, appeal: true, withdraw: true });
    expect(correctionActions('Accepted')).toEqual({ reply: false, appeal: false, withdraw: false });
    expect([isOpenCorrection('Appealed'), isOpenCorrection('Withdrawn')]).toEqual([true, false]);
  });
});
