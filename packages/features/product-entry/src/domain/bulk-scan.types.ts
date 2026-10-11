/** The lookup facts a bulk scan needs to decide between adding a row directly and asking the seller. */
export type ScanLookup = {
  readonly kind: string;
  readonly matches: readonly ScanMatch[];
};
export type ScanMatch = {
  readonly itemKind?: string;
  readonly unitActive?: boolean | null;
  readonly catalogStatus: string;
  readonly storeProductStatus?: string | null;
};
