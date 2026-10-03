import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';

import { createHttpStoreRepository } from './infrastructure/http-store-repository';
import type { StoreModule } from './module.types';

export const createStoreModule = (deps: { api: Api }): StoreModule => ({
  stores: createHttpStoreRepository(deps.api),
});

export const [StoreModuleProvider, useStoreModule] = createModuleContext<StoreModule>('store');
