import type { TokenProvider } from '@dukani/http';

export type SessionUser = {
  readonly id: string;
  readonly mobile: string;
  readonly displayName: string | null;
  readonly defaultStoreId: string | null;
  readonly platformRoles: readonly string[];
};

export type SessionTokens = {
  readonly accessToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshToken?: string;
  readonly user: SessionUser;
};

export type SessionState =
  | { readonly status: 'unknown' | 'signed-out' }
  | { readonly status: 'signed-in'; readonly user: SessionUser };

/**
 * Session port. Adapters decide where the refresh token lives:
 * - BFF (live): httpOnly cookie set by the app's `/bff/auth/*` route handlers; JS never sees it.
 * - Memory (mock mode / tests): sessionStorage.
 */
export type Session = TokenProvider & {
  /** Changes on sign-in/sign-out/expiry, not on token renewal for the same user. */
  getSessionVersion(): number;
  getSessionSignal(): AbortSignal;
  getState(): SessionState;
  subscribe(listener: (state: SessionState) => void): () => void;
  /** Called after a successful OTP verification. */
  signIn(tokens: SessionTokens): Promise<void>;
  signOut(): Promise<void>;
  /** Restores the session on app start (refresh). */
  restore(): Promise<SessionState>;
};
