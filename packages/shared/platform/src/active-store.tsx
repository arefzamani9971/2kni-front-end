'use client';
import { can, type MemberRole, type Permission } from '@dukani/domain';
import { createModuleContext } from './module-context';

/** The store the seller is working in (`/s/[storeId]`), resolved once by the store gate. */
export type ActiveStore = {
  readonly id: string;
  readonly name: string;
  readonly storeTypeKey: string;
  readonly role: MemberRole;
  readonly permissions: readonly string[];
};

export const [ActiveStoreProvider, useActiveStore] = createModuleContext<ActiveStore>('active store');

/** Permission check for UI affordances; the server enforces the same rule (403 PERMISSION_DENIED). */
export const useCan = (permission: Permission): boolean => can(useActiveStore(), permission);
