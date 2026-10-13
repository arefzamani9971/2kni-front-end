export type StoreQr = {
  readonly publicCode: string;
  readonly joinUrl: string;
  readonly displayName: string;
  readonly address: string | null;
  readonly available: boolean;
};
