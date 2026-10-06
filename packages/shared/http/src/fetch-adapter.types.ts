export type FetchAdapterOptions = {
  /** Use same-origin only for the app BFF; API calls default to omit. */
  readonly credentials?: RequestCredentials;
  readonly baseUrl: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
  readonly isOnline?: () => boolean;
};
