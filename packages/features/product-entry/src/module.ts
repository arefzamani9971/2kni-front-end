import type { Api } from '@dukani/http';
import { createModuleContext, type DraftStore } from '@dukani/platform';
import type { EntryCatalog, EntryCommands, EntryDrafts } from './application/ports';
import { createEntryDrafts } from './infrastructure/entry-draft-repository';
import { createHttpEntryCatalog, createHttpEntryCommands } from './infrastructure/http-entry-api';

export type ProductEntryModule = { readonly catalog: EntryCatalog; readonly commands: EntryCommands; readonly drafts: EntryDrafts };

export const createProductEntryModule = (deps: { api: Api; drafts: DraftStore; userId: () => string }): ProductEntryModule => ({
  catalog: createHttpEntryCatalog(deps.api),
  commands: createHttpEntryCommands(deps.api),
  drafts: createEntryDrafts(deps.drafts, deps.userId),
});

export const [ProductEntryModuleProvider, useProductEntryModule] = createModuleContext<ProductEntryModule>('product-entry');
