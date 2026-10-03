export type FetchAdapterOptions = {
  readonly baseUrl: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
  readonly isOnline?: () => boolean;
};
