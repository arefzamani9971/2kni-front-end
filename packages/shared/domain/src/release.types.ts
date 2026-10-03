import type { PRODUCT_RELEASES } from './release.constants';

export type ProductRelease = keyof typeof PRODUCT_RELEASES;

/** Features that are gated independently of the release number (waiting for a backend change request). */
export type FeatureFlag = 'service-items' | 'print-orders' | 'memberships';
