import type { MemberRole } from '@dukani/domain';

/** The store the seller is working in (`/s/[storeId]`), resolved once by the store gate. */
export type ActiveStore = {
  readonly id: string;
  readonly name: string;
  readonly storeTypeKey: string;
  readonly role: MemberRole;
  readonly permissions: readonly string[];
};
