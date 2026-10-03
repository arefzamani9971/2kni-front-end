import type { DeactivatedStore, Invitation, OwnershipTransferOffer } from '../../domain/store.types';

export type StoresScreenProps = {
  readonly storeHref: (storeId: string) => string;
  readonly onCreate: () => void;
  readonly onBack?: () => void;
  /** Invitation review (staff-access feature); without it invitations are listed but not opened. */
  readonly onInvitation?: (invitation: Invitation) => void;
  /** Ownership transfer review; without it transfers are listed but not opened. */
  readonly onOwnershipTransfer?: (transfer: OwnershipTransferOffer) => void;
  /** Reactivation path of a stopped store (F66); never a normal entry. */
  readonly onReactivate?: (store: DeactivatedStore) => void;
};
