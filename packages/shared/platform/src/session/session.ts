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

export type SessionState = { readonly status: 'unknown' | 'signed-out' } | { readonly status: 'signed-in'; readonly user: SessionUser };

/**
 * Session port. Adapters decide where the refresh token lives:
 * - BFF (live): httpOnly cookie set by the app's `/bff/auth/*` route handlers; JS never sees it.
 * - Memory (mock mode / tests): sessionStorage.
 */
export type Session = TokenProvider & {
  getState(): SessionState;
  subscribe(listener: (state: SessionState) => void): () => void;
  /** Called after a successful OTP verification. */
  signIn(tokens: SessionTokens): Promise<void>;
  signOut(): Promise<void>;
  /** Restores the session on app start (refresh). */
  restore(): Promise<SessionState>;
};

/** Maps the backend `AuthTokensDto` (verify/refresh) to session tokens. */
export const toSessionTokens = (dto: {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken?: string;
  user: { id: string; mobile: string; displayName?: string | null; defaultStoreId?: string | null; platformRoles: string[] };
}): SessionTokens => ({
  accessToken: dto.accessToken,
  accessTokenExpiresAt: dto.accessTokenExpiresAt,
  ...(dto.refreshToken ? { refreshToken: dto.refreshToken } : {}),
  user: {
    id: dto.user.id,
    mobile: dto.user.mobile,
    displayName: dto.user.displayName ?? null,
    defaultStoreId: dto.user.defaultStoreId ?? null,
    platformRoles: dto.user.platformRoles,
  },
});
