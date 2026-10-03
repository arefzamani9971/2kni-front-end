import type { Invitation } from '../../domain/store.types';

export type StoresScreenProps = {
  readonly storeHref: (storeId: string) => string;
  readonly onCreate: () => void;
  readonly onBack?: () => void;
  /** Invitation review (staff-access feature); invitations are hidden until it is provided. */
  readonly onInvitation?: (invitation: Invitation) => void;
};
