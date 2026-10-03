import type { ProductRelease } from './release.types';
import { PRODUCT_RELEASES } from './release.constants';

export const isReleased = (current: ProductRelease, required: ProductRelease): boolean =>
  PRODUCT_RELEASES[current] >= PRODUCT_RELEASES[required];

export const parseRelease = (value: string | undefined, fallback: ProductRelease = '1.0'): ProductRelease =>
  value && value in PRODUCT_RELEASES ? (value as ProductRelease) : fallback;
