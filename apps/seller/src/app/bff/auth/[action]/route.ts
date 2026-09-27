import { createAuthBffHandler } from '@dukani/app-core/server';

/** Live mode only: `/bff/auth/verify|refresh|logout` keep the refresh token in an httpOnly cookie. */
export const POST = createAuthBffHandler({
  apiUrl: process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5080',
  secure: process.env.BFF_COOKIE_SECURE !== 'false',
});

export const dynamic = 'force-dynamic';
