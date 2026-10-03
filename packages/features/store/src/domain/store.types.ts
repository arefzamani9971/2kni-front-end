import type { Dto } from '@dukani/contracts';

export type BusinessMode = Dto<'BusinessMode'>;

export type StoreListItem = {
  readonly id: string;
  readonly name: string;
  readonly typeName: string;
  readonly role: Dto<'MemberRole'>;
  readonly isDefault: boolean;
};

export type Invitation = {
  readonly id: string;
  readonly storeId: string;
  readonly storeName: string;
  readonly invitedBy: string | null;
};

export type MyStores = {
  readonly stores: readonly StoreListItem[];
  readonly invitations: readonly Invitation[];
};
