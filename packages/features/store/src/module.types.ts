import type { StoreDraftRepository, StoreRepository } from './application/ports';

export type StoreModule = { readonly stores: StoreRepository; readonly drafts: StoreDraftRepository };
