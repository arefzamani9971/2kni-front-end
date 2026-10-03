import type { Api, HttpClient } from '@dukani/http';
import type { DraftStore, EventBus, KeyValueStorage, Logger, PublicEnv, Session } from '@dukani/platform';

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
