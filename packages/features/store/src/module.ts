import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';
import type { StoreRepository } from './application/ports';
import { createHttpStoreRepository } from './infrastructure/http-store-repository';

export type StoreModule = { readonly stores: StoreRepository };

export const createStoreModule = (deps: { api: Api }): StoreModule => ({ stores: createHttpStoreRepository(deps.api) });

export const [StoreModuleProvider, useStoreModule] = createModuleContext<StoreModule>('store');
