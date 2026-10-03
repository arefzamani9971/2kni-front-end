import type { Api, HttpClient } from '@dukani/http';
import type { ApiMode, KeyValueStorage, Session } from '@dukani/platform';
import type { AuthGateway, ChallengeStore } from './application/ports';

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
