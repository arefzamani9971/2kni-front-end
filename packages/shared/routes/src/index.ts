export * from './seller';
export type { SellerRoutes } from './seller.types';
export * from './customer';

const isControl = (c: string) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127;

/**
 * Keeps a post-login destination inside the app (no open redirects, F01-S14): a single leading `/`,
 * not `//` or `/\` (browsers read both as another host) and no control characters.
 */
export const safeNext = (next: string | null | undefined, fallback: string): string =>
  next && /^\/(?![/\\])/.test(next) && ![...next].some(isControl) ? next : fallback;
