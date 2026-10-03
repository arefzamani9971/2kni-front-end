import { type FeatureFlag, parseRelease } from '@dukani/domain';
import type { PublicEnv } from './env.types';

/**
 * Reads NEXT_PUBLIC_* values. Next.js inlines them at build time, so each key must be read
 * with its literal name in the app (see apps/*\/src/env.ts) and passed here.
 */
export const parsePublicEnv = (raw: Record<string, string | undefined>): PublicEnv => ({
  apiBaseUrl: raw.NEXT_PUBLIC_API_URL ?? 'http://localhost:5080',
  apiMode: raw.NEXT_PUBLIC_API_MODE === 'live' ? 'live' : 'mock',
  release: parseRelease(raw.NEXT_PUBLIC_RELEASE),
  flags: (raw.NEXT_PUBLIC_FLAGS ?? '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean) as FeatureFlag[],
  sellerAppUrl: raw.NEXT_PUBLIC_SELLER_URL ?? 'http://localhost:3001',
  customerAppUrl: raw.NEXT_PUBLIC_CUSTOMER_URL ?? 'http://localhost:3002',
  landingUrl: raw.NEXT_PUBLIC_LANDING_URL ?? 'http://localhost:3000',
  mapTileUrl: raw.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
});
