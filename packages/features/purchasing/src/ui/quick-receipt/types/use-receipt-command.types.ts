import type { QueryKey } from '@dukani/data';
import type { PendingReceipt, RecordedReceipt } from '../../../domain/receipt.types';

export type ReceiptCommandOptions<D> = {
  /** Puts the frozen receipt into the draft (stable function). */
  readonly freeze: (draft: D, pending: PendingReceipt) => D;
  /** Takes it out again after a definitive refusal (stable function). */
  readonly release: (draft: D) => D;
  /** Saves the confirmed receipt into the flow's draft; a failure here never replays the command. */
  readonly onRecorded: (recorded: RecordedReceipt, pending: PendingReceipt) => Promise<void>;
  readonly invalidates?: readonly QueryKey[];
};
