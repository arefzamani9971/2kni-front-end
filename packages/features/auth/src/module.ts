import type { Api, HttpClient } from '@dukani/http';
import { createModuleContext, type ApiMode, type KeyValueStorage, type Session } from '@dukani/platform';
import type { AuthGateway, ChallengeStore } from './application/ports';
import { createApiAuthGateway } from './infrastructure/api-auth-gateway';
import { createBffAuthGateway } from './infrastructure/bff-auth-gateway';
import { createChallengeStore } from './infrastructure/session-challenge-store';

export type AuthModule = {
  readonly gateway: AuthGateway;
  readonly challenges: ChallengeStore;
  readonly session: Session;
};

export type AuthModuleDeps = {
  readonly mode: ApiMode;
  readonly api: Api;
  /** Same-origin client for `/bff/*` (live mode only). */
  readonly sameOriginHttp: HttpClient;
  readonly session: Session;
  /** Session-scoped storage for the pending OTP challenge. */
  readonly storage: KeyValueStorage;
};

/** Composition of the auth feature; the app decides the adapters by mode. */
export const createAuthModule = (deps: AuthModuleDeps): AuthModule => ({
  gateway: deps.mode === 'live' ? createBffAuthGateway(deps.api, deps.sameOriginHttp) : createApiAuthGateway(deps.api),
  challenges: createChallengeStore(deps.storage),
  session: deps.session,
});

export const [AuthModuleProvider, useAuthModule] = createModuleContext<AuthModule>('auth');
