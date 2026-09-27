import { parsePublicEnv } from '@dukani/platform';

/** NEXT_PUBLIC_* are inlined at build time, so each key is read by its literal name here. */
export const env = parsePublicEnv({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_API_MODE: process.env.NEXT_PUBLIC_API_MODE,
  NEXT_PUBLIC_RELEASE: process.env.NEXT_PUBLIC_RELEASE,
  NEXT_PUBLIC_FLAGS: process.env.NEXT_PUBLIC_FLAGS,
  NEXT_PUBLIC_SELLER_URL: process.env.NEXT_PUBLIC_SELLER_URL,
  NEXT_PUBLIC_CUSTOMER_URL: process.env.NEXT_PUBLIC_CUSTOMER_URL,
  NEXT_PUBLIC_LANDING_URL: process.env.NEXT_PUBLIC_LANDING_URL,
  NEXT_PUBLIC_MAP_TILE_URL: process.env.NEXT_PUBLIC_MAP_TILE_URL,
});
