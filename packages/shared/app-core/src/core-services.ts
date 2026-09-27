import {
  compose,
  createApi,
  createFetchAdapter,
  withAuth,
  withErrorMapping,
  withIdempotency,
  withLogging,
  withRetry,
  type Api,
  type HttpClient,
} from '@dukani/http';
import {
  createBffSession,
  createConsoleLogger,
  createEventBus,
  createIdbDraftStore,
  createMemoryDraftStore,
  createMemorySession,
  createWebStorage,
  type DraftStore,
  type EventBus,
  type KeyValueStorage,
  type Logger,
  type PublicEnv,
  type Session,
  toSessionTokens,
} from '@dukani/platform';

/** Services every app needs; each app's composition root adds its feature services on top. */
export type CoreServices = {
  readonly env: PublicEnv;
  readonly http: HttpClient;
  /** Authenticated, idempotent, retrying, error-mapped API facade. */
  readonly api: Api;
  readonly session: Session;
  readonly bus: EventBus;
  readonly logger: Logger;
  readonly drafts: DraftStore;
  /** Per-device preferences (last store, filters). */
  readonly prefs: KeyValueStorage;
};

/**
 * Builds the HTTP stack and session for the current mode:
 * - live: refresh token in the BFF httpOnly cookie (`/bff/auth/*`),
 * - mock: tokens in sessionStorage, MSW answers `/api/v1/*` in the browser.
 * Decorator order (outer → inner): logging → errors → auth → retry → idempotency → fetch.
 */
export const createCoreServices = (env: PublicEnv, opts: { onSessionExpired?: () => void } = {}): CoreServices => {
  const logger = createConsoleLogger(process.env.NODE_ENV === 'production' ? 'warn' : 'debug');
  const baseUrl = env.apiMode === 'mock' ? '' : env.apiBaseUrl;
  const transport = createFetchAdapter({ baseUrl });
  const anonymous = createApi(compose(transport, withIdempotency, withErrorMapping));

  const session =
    env.apiMode === 'live'
      ? createBffSession({ onExpired: opts.onSessionExpired })
      : createMemorySession(createWebStorage('session'), {
          onExpired: opts.onSessionExpired,
          renew: async (refreshToken) => {
            const t = await anonymous.post('/api/v1/auth/refresh', { body: { refreshToken }, auth: false });
            return toSessionTokens(t);
          },
        });

  const http = compose(transport, withIdempotency, withRetry(), withAuth(session), withErrorMapping, withLogging(logger));
  const hasIdb = typeof indexedDB !== 'undefined';
  return {
    env,
    http,
    api: createApi(http),
    session,
    bus: createEventBus(),
    logger,
    drafts: hasIdb ? createIdbDraftStore() : createMemoryDraftStore(),
    prefs: createWebStorage('local'),
  };
};
