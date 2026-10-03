import type { SessionTokens } from './session.types';

/** Maps the backend `AuthTokensDto` (verify/refresh) to session tokens. */
export const toSessionTokens = (dto: {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken?: string;
  user: {
    id: string;
    mobile: string;
    displayName?: string | null;
    defaultStoreId?: string | null;
    platformRoles: string[];
  };
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
