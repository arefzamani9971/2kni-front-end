import type { CatalogPort } from './application/catalog-port.types';
import type { CommandJournal } from './application/command-journal.types';
import type { CorrectionPort } from './application/correction-port.types';
import type { CatalogEditorStore } from './application/editor-store.types';
export type CatalogModule = {
  readonly catalog: CatalogPort;
  readonly corrections: CorrectionPort;
  readonly journal: CommandJournal;
  readonly editors: CatalogEditorStore;
};
