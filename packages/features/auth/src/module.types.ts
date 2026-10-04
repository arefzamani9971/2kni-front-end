import type { Api, HttpClient } from '@dukani/http';
import type { ApiMode, KeyValueStorage, Session } from '@dukani/platform';
import type { AuthLayout } from '@dukani/ui-kit';
import type { AuthGateway, ChallengeStore } from './application/ports';

export type AuthModule = {
  readonly gateway: AuthGateway;
  readonly challenges: ChallengeStore;
  readonly session: Session;
  /** Product layout of the sign-in screens (seller `split`, customer `cards`). */
  readonly layout: AuthLayout;
  /** Whether the OTP screen may show the Development `devCode` (never in production, F01-S16). */
  readonly showDevCode: boolean;
};

export type AuthModuleDeps = {
  readonly mode: ApiMode;
  readonly api: Api;
  /** Same-origin client for `/bff/*` (live mode only). */
  readonly sameOriginHttp: HttpClient;
  readonly session: Session;
  /** Session-scoped storage for the pending OTP challenge. */
  readonly storage: KeyValueStorage;
  /** Default `split` (seller Figma); the customer app passes `cards`. */
  readonly layout?: AuthLayout;
  /** Decided by the app (build mode); default false so a missing flag never leaks the code. */
  readonly showDevCode?: boolean;
};
