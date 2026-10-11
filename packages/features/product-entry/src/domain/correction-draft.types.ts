export type CorrectionDraft = {
  readonly evidence?: readonly { readonly id: string; readonly file: File; readonly fileId?: string }[];
  readonly reason: string;
  readonly field: 'title' | 'description';
  readonly value: string;
  readonly evidenceFileIds: readonly string[];
  readonly pending?: {
    readonly operationId: string;
    readonly reason: string;
    readonly field: 'title' | 'description';
    readonly value: string;
    readonly evidenceFileIds: readonly string[];
  };
  readonly resultId?: string;
};
