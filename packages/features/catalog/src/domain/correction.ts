import type {
  CorrectionActions,
  CorrectionDraft,
  CorrectionDraftIssue,
  CorrectionField,
  CorrectionStatus,
  NewCorrection,
} from './correction.types';

export const MAX_CHANGES = 30;
export const REASON_MAX = 2000;
export const MAX_EVIDENCE = 10;

export const emptyCorrectionDraft: CorrectionDraft = { selected: [], values: {}, reason: '' };

/** Correction keys that are not attributes; the client labels them (attributes carry their reference names). */
export const FIXED_CORRECTION_KEYS = [
  'title',
  'description',
  'brandId',
  'netContentValue',
  'netContentUnitId',
] as const;

export const isFixedCorrectionKey = (key: string): key is (typeof FIXED_CORRECTION_KEYS)[number] =>
  (FIXED_CORRECTION_KEYS as readonly string[]).includes(key);

/** Open requests block a second one for the same item (CORRECTION_ALREADY_OPEN). */
export const isOpenCorrection = (status: CorrectionStatus) =>
  status === 'Submitted' || status === 'Reviewing' || status === 'NeedInfo' || status === 'Appealed';

/** Reply only while information is requested, appeal only a rejection, withdraw before a decision or after a rejection. */
export const correctionActions = (status: CorrectionStatus): CorrectionActions => ({
  reply: status === 'NeedInfo',
  appeal: status === 'Rejected',
  withdraw: status === 'Submitted' || status === 'NeedInfo' || status === 'Rejected',
});

/** Toggling a field starts its proposal from the current value, so only the real change is edited. */
export const toggleField = (draft: CorrectionDraft, field: CorrectionField, on: boolean): CorrectionDraft => {
  const selected = on
    ? [...draft.selected.filter((k) => k !== field.key), field.key]
    : draft.selected.filter((k) => k !== field.key);
  const values = { ...draft.values };
  if (on && values[field.key] === undefined) values[field.key] = field.currentValue ?? '';
  if (!on) delete values[field.key];
  return { ...draft, selected, values };
};

const sameValue = (field: CorrectionField, value: string) => {
  const current = (field.currentValue ?? '').trim();
  if (field.valueType === 'MultiOption' || field.valueType === 'Option')
    return [...splitKeys(value)].sort().join(',') === [...splitKeys(current)].sort().join(',');
  return value.trim() === current;
};

/** Option keys as the server stores them (comma separated). */
export const splitKeys = (value: string) =>
  value
    .split(/[,،|]/)
    .map((k) => k.trim())
    .filter(Boolean);

/** Client-side check before sending; the server re-checks every key and value against the capabilities. */
export const correctionIssues = (
  fields: readonly CorrectionField[],
  draft: CorrectionDraft,
): CorrectionDraftIssue[] => {
  const issues: CorrectionDraftIssue[] = [];
  const chosen = fields.filter((f) => draft.selected.includes(f.key));
  if (chosen.length === 0) issues.push({ field: 'selection', code: 'NONE' });
  if (chosen.length > MAX_CHANGES) issues.push({ field: 'selection', code: 'TOO_MANY' });
  for (const field of chosen) {
    const value = draft.values[field.key] ?? '';
    if (value.trim() === '' && !field.clearable) issues.push({ field: field.key, code: 'REQUIRED' });
    else if (field.maxLength != null && value.trim().length > field.maxLength)
      issues.push({ field: field.key, code: 'TOO_LONG' });
    else if (sameValue(field, value)) issues.push({ field: field.key, code: 'UNCHANGED' });
  }
  if (draft.reason.trim() === '') issues.push({ field: 'reason', code: 'REQUIRED' });
  else if (draft.reason.trim().length > REASON_MAX) issues.push({ field: 'reason', code: 'TOO_LONG' });
  if ((draft.evidence ?? []).some((e) => !e.fileId)) issues.push({ field: 'evidence', code: 'UPLOADING' });
  if ((draft.evidence ?? []).length > MAX_EVIDENCE) issues.push({ field: 'evidence', code: 'TOO_MANY' });
  return issues;
};

/** The create body: only server-offered keys the seller selected; an empty value clears the field. */
export const toCorrectionRequest = (
  fields: readonly CorrectionField[],
  draft: CorrectionDraft,
): NewCorrection => ({
  proposedChanges: Object.fromEntries(
    fields
      .filter((f) => draft.selected.includes(f.key))
      .map((f) => {
        const value = (draft.values[f.key] ?? '').trim();
        return [f.key, value === '' ? null : value];
      }),
  ),
  reason: draft.reason.trim(),
  evidenceFileIds: (draft.evidence ?? []).flatMap((e) => (e.fileId ? [e.fileId] : [])),
});

/** Display text of a stored value: option keys and unit ids become their names; other values stay as they are. */
export const describeValue = (field: CorrectionField | undefined, value: string | null | undefined) => {
  if (value == null || value === '') return null;
  if (!field) return value;
  if (field.valueType === 'Option' || field.valueType === 'MultiOption' || field.valueType === 'Unit')
    return splitKeys(value)
      .map((k) => field.allowedValues.find((o) => o.value.toLowerCase() === k.toLowerCase())?.name ?? k)
      .join('، ');
  if (field.valueType === 'Brand' && value === field.currentValue) return field.currentName ?? value;
  return value;
};
