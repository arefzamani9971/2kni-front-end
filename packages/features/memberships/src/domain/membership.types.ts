export type StoreIntroduction = {
  readonly publicCode: string;
  readonly displayName: string;
  readonly address: string | null;
  readonly available: boolean;
};
export type MembershipStatus = { readonly storeId: string; readonly isMember: boolean };
