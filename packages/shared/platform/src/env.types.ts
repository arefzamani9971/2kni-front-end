import type { FeatureFlag, ProductRelease } from '@dukani/domain';

export type ApiMode = 'mock' | 'live';

export type PublicEnv = {
  readonly apiBaseUrl: string;
  readonly apiMode: ApiMode;
  readonly release: ProductRelease;
  readonly flags: readonly FeatureFlag[];
  readonly sellerAppUrl: string;
  readonly customerAppUrl: string;
  readonly landingUrl: string;
  readonly mapTileUrl: string;
};
