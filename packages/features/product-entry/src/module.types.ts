import type { EntryCatalog, EntryCommands, EntryDrafts } from './application/ports';

export type ProductEntryModule = {
  readonly catalog: EntryCatalog;
  readonly commands: EntryCommands;
  readonly drafts: EntryDrafts;
};
