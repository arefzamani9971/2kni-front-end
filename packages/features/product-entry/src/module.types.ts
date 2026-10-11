import type {
  EntrySelections,
  EntryCatalog,
  EntryCommands,
  EntryDrafts,
  BulkDrafts,
} from './application/ports';
import type { BarcodeCapture } from './domain/barcode-capture.types';
import type { CorrectionDraft } from './domain/correction-draft.types';
import type { FlowAnalytics } from '@dukani/platform';

export type ProductEntryModule = {
  readonly analytics: FlowAnalytics;
  readonly corrections: {
    read(storeId: string, itemId: string): Promise<CorrectionDraft | null>;
    write(storeId: string, itemId: string, value: CorrectionDraft): Promise<void>;
  };
  readonly bulkDrafts: BulkDrafts;
  readonly selections: EntrySelections;
  readonly capture: {
    read(storeId: string): Promise<BarcodeCapture | null>;
    write(storeId: string, value: BarcodeCapture): Promise<void>;
  };
  readonly catalog: EntryCatalog;
  readonly commands: EntryCommands;
  readonly drafts: EntryDrafts;
};
