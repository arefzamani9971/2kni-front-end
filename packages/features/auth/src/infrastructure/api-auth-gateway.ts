import type { Api } from '@dukani/http';
import { toSessionTokens } from '@dukani/platform';
import type { AuthGateway } from '../application/ports';

/** Direct adapter: `/api/v1/auth/otp/request|verify` (mock mode; the session adapter keeps the refresh token). */
export const createApiAuthGateway = (api: Api): AuthGateway => ({
  async requestOtp(mobile) {
    const dto = await api.post('/api/v1/auth/otp/request', { body: { mobile }, auth: false });
    return { ...dto, mobile };
  },
  async verifyOtp(challenge, code) {
    const dto = await api.post('/api/v1/auth/otp/verify', {
      body: { requestId: challenge.requestId, code, deviceLabel: deviceLabel() },
      auth: false,
    });
    return { tokens: toSessionTokens(dto), isNewUser: dto.isNewUser };
  },
});

export const deviceLabel = (): string | undefined => {
  if (typeof navigator === 'undefined') return undefined;
  const ua = navigator.userAgent;
  const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : 'Web';
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return `${browser} · ${os}`;
};
