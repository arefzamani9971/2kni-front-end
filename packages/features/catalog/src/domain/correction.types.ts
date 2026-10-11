/** How a correction field is edited (server `CorrectionValueType`). */
export type CorrectionValueType =
  'Text' | 'LongText' | 'Number' | 'Bool' | 'Option' | 'MultiOption' | 'Brand' | 'Unit';

export type CorrectionStatus =
  'Draft' | 'Submitted' | 'Reviewing' | 'NeedInfo' | 'Accepted' | 'Rejected' | 'Appealed' | 'Withdrawn';

/** One allowed value: what is sent and its reference name (option value, unit name). */
export type CorrectionOption = { readonly value: string; readonly name: string };

/** A field the server lets this store propose (F11 §4); fixed keys are labelled by the client, attributes carry `name`. */
export type CorrectionField = {
  readonly key: string;
  readonly valueType: CorrectionValueType;
  readonly name?: string | null;
  readonly currentValue?: string | null;
  readonly currentName?: string | null;
  readonly clearable: boolean;
  readonly maxLength?: number | null;
  readonly allowedValues: readonly CorrectionOption[];
};

export type CorrectionCapabilities = {
  readonly catalogItemId: string;
  readonly title: string;
  readonly fields: readonly CorrectionField[];
  readonly openCorrectionId?: string | null;
};

/** The create body: server keys only, an empty value as null (clear). */
export type NewCorrection = {
  readonly proposedChanges: Readonly<Record<string, string | null>>;
  readonly reason: string;
  readonly evidenceFileIds: readonly string[];
};

export type CorrectionReply = { readonly message: string; readonly evidenceFileIds: readonly string[] };

export type CorrectionHistoryEntry = {
  readonly at: string;
  readonly status: CorrectionStatus;
  readonly note?: string | null;
};

/** A store's request with its timeline (F11 §9A): status and scope come from fields, never from server text. */
export type CorrectionRequest = {
  readonly id: string;
  readonly catalogItemId?: string | null;
  readonly productTypeId?: string | null;
  readonly subject: string;
  readonly status: CorrectionStatus;
  readonly proposedChanges: Readonly<Record<string, string | null | undefined>>;
  readonly reason: string;
  readonly evidenceFileIds: readonly string[];
  readonly decisionReason?: string | null;
  readonly createdAt: string;
  readonly history: readonly CorrectionHistoryEntry[];
};

/** One evidence file: picked locally, uploaded on its own; only uploaded ids are sent (F11 §6). */
export type EvidenceFile = { readonly id: string; readonly file: File; readonly fileId?: string };

/** CAT-CORRECTION draft of one catalog item, kept per user/store/item so a refresh keeps the form (F11). */
export type CorrectionDraft = {
  /** Keys the seller marked as wrong, in capability order. */
  readonly selected: readonly string[];
  /** Proposed value per key in the capability's text form ('' = clear, when the field allows it). */
  readonly values: Readonly<Record<string, string>>;
  readonly reason: string;
  readonly evidence?: readonly EvidenceFile[];
};

export type CorrectionDraftIssue =
  | { readonly field: 'selection'; readonly code: 'NONE' | 'TOO_MANY' }
  | { readonly field: 'reason'; readonly code: 'REQUIRED' | 'TOO_LONG' }
  | { readonly field: 'evidence'; readonly code: 'UPLOADING' | 'TOO_MANY' }
  | { readonly field: string; readonly code: 'REQUIRED' | 'TOO_LONG' | 'UNCHANGED' };

/** What the seller may do with a request in its status (domain transitions, F11 §6–7). */
export type CorrectionActions = {
  readonly reply: boolean;
  readonly appeal: boolean;
  readonly withdraw: boolean;
};
