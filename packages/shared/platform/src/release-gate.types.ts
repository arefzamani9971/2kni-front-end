import type { FeatureFlag, ProductRelease } from '@dukani/domain';

export type ReleaseConfig = { readonly current: ProductRelease; readonly flags: readonly FeatureFlag[] };
