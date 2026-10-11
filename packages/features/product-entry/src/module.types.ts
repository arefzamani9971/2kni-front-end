import type {
  EntrySelections,
  EntryCatalog,
  EntryCommands,
  EntryDrafts,
  BulkDrafts,
} from './application/ports';
import type { BarcodeCapture } from './domain/barcode-capture.types';

export type ProductEntryModule = {
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
