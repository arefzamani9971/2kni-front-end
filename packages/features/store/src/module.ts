import type { Api } from '@dukani/http';
import { createMemoryDraftStore, createModuleContext, type DraftStore } from '@dukani/platform';

import { createHttpStoreRepository } from './infrastructure/http-store-repository';
import { createStoreDrafts } from './infrastructure/store-draft-repository';
import type { StoreModule } from './module.types';

/** `drafts`/`userId` keep the pending-store draft per user (F02 §8); without them the draft lives in memory. */
export const createStoreModule = (deps: { api: Api; drafts?: DraftStore; userId?: () => string }): StoreModule => ({
  stores: createHttpStoreRepository(deps.api),
  drafts: createStoreDrafts(deps.drafts ?? createMemoryDraftStore(), deps.userId ?? (() => 'anonymous')),
});

export const [StoreModuleProvider, useStoreModule] = createModuleContext<StoreModule>('store');
