'use client';
import { can, type Permission } from '@dukani/domain';
import { createModuleContext } from './module-context';
import type { ActiveStore } from './active-store.types';

export const [ActiveStoreProvider, useActiveStore] = createModuleContext<ActiveStore>('active store');

/** Permission check for UI affordances; the server enforces the same rule (403 PERMISSION_DENIED). */
export const useCan = (permission: Permission): boolean => can(useActiveStore(), permission);
