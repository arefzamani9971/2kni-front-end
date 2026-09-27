import type { Dto } from '@dukani/contracts';
import type { Api, HttpClient } from '@dukani/http';
import { toSessionTokens } from '@dukani/platform';
import type { AuthGateway } from '../application/ports';
import { deviceLabel } from './api-auth-gateway';

/**
 * Live adapter: OTP request goes to the API; verification goes through the app's BFF route
 * (`POST /bff/auth/verify`) which stores the refresh token in an httpOnly cookie and returns the rest.
 */
export const createBffAuthGateway = (api: Api, sameOriginHttp: HttpClient, basePath = '/bff/auth'): AuthGateway => ({
  async requestOtp(mobile) {
    const dto = await api.post('/api/v1/auth/otp/request', { body: { mobile }, auth: false });
    return { ...dto, mobile };
  },
  async verifyOtp(challenge, code) {
    const res = await sameOriginHttp.request<Omit<Dto<'AuthTokensDto'>, 'refreshToken'>>({
      method: 'POST',
      path: `${basePath}/verify`,
      body: { requestId: challenge.requestId, code, deviceLabel: deviceLabel() },
      auth: false,
    });
    return { tokens: toSessionTokens(res.data), isNewUser: res.data.isNewUser };
  },
});
