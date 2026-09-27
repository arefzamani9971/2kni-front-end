/** Product releases, same numbers as the backend `ProductRelease` enum. */
export const PRODUCT_RELEASES = { '1.0': 100, '1.1': 110, '1.2': 120, '2.0': 200, '2.1': 210, '3.0': 300, '3.1': 310, '4.0': 400 } as const;

export type ProductRelease = keyof typeof PRODUCT_RELEASES;

/** Features that are gated independently of the release number (waiting for a backend change request). */
export type FeatureFlag = 'service-items' | 'print-orders' | 'memberships';

export const isReleased = (current: ProductRelease, required: ProductRelease): boolean =>
  PRODUCT_RELEASES[current] >= PRODUCT_RELEASES[required];

export const parseRelease = (value: string | undefined, fallback: ProductRelease = '1.0'): ProductRelease =>
  value && value in PRODUCT_RELEASES ? (value as ProductRelease) : fallback;
