export * from './seller';
export * from './customer';

/** Keeps a post-login destination inside the app (no open redirects). */
export const safeNext = (next: string | null | undefined, fallback: string): string =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
