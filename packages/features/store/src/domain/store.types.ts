import type { Dto } from '@dukani/contracts';

export type BusinessMode = Dto<'BusinessMode'>;

export type StoreListItem = {
  readonly id: string;
  readonly name: string;
  readonly typeName: string;
  readonly role: Dto<'MemberRole'>;
  readonly isDefault: boolean;
};

/** A pending invitation: not a membership until accepted (F02 §4). */
export type Invitation = {
  readonly id: string;
  readonly storeId: string;
  readonly storeName: string;
  readonly invitedBy: string | null;
  readonly expiresAt: string;
};

/** A pending ownership transfer to the caller: ownership has not moved yet. */
export type OwnershipTransferOffer = {
  readonly id: string;
  readonly storeId: string;
  readonly storeName: string;
  readonly expiresAt: string;
};

/** A stopped store of the caller: no normal entry; only the reactivation path (F66). */
export type DeactivatedStore = {
  readonly storeId: string;
  readonly storeName: string;
  readonly deactivatedAt: string | null;
  readonly canReactivate: boolean;
};

/** `GET /stores`: four independent collections that are never merged (F02 §4, AC05). */
export type MyStores = {
  readonly stores: readonly StoreListItem[];
  readonly invitations: readonly Invitation[];
  readonly ownershipTransfers: readonly OwnershipTransferOffer[];
  readonly deactivatedStores: readonly DeactivatedStore[];
};
