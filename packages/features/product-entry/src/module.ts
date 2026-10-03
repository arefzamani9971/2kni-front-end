import type { Api } from '@dukani/http';
import { createModuleContext, type DraftStore } from '@dukani/platform';

import { createEntryDrafts } from './infrastructure/entry-draft-repository';
import { createHttpEntryCatalog, createHttpEntryCommands } from './infrastructure/http-entry-api';
import type { ProductEntryModule } from './module.types';

export const createProductEntryModule = (deps: {
  api: Api;
  drafts: DraftStore;
  userId: () => string;
}): ProductEntryModule => ({
  catalog: createHttpEntryCatalog(deps.api),
  commands: createHttpEntryCommands(deps.api),
  drafts: createEntryDrafts(deps.drafts, deps.userId),
});

export const [ProductEntryModuleProvider, useProductEntryModule] =
  createModuleContext<ProductEntryModule>('product-entry');
