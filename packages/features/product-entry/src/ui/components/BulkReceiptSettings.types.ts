import type { BulkDraft, BulkReceipt } from '../../domain/bulk-draft.types';

export type BulkReceiptSettingsProps = {
  receipt: BulkReceipt;
  mode: NonNullable<BulkDraft['scanMode']>;
  disabled: boolean;
  onReceiptChange: (patch: Partial<BulkReceipt>) => void;
  onModeChange: (mode: NonNullable<BulkDraft['scanMode']>) => void;
};
