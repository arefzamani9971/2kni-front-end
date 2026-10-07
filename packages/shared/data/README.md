# Application data facade

Features import only `@dukani/data`. TanStack implementation details remain in
`src/adapters/tanstack`.

## Client and cache

- `createDataClient(): DataClient` creates an opaque handle. Pass it to `DataProvider`
  when sharing a cache explicitly, or omit `client` for one cache per provider.
- The provider captures an explicit client on mount. Changing that prop does not replace it.
  Alternatively, supply `scopeKey` (without `client`): a scope change creates a new owned
  cache and remounts descendants. The old owned cache is cleared and its requests cancelled
  on disposal.
- An explicitly supplied client is owned by its caller; unmounting the provider does not clear it.
  Owned scope cleanup supports React StrictMode without discarding an active cache.
- `useQueryCache()` returns a stable object with typed `get` and `set`; `set` returns
  void. `useInvalidate()` invalidates by key prefix and awaits refetch of active queries.
- `createQueryKeys(scope)(storeId?)` builds keys as `[scope, storeId?, …parts]`.
  Callers must include the appropriate store and use a distinct provider scope for each session.

## Queries and refresh

- Reads are fresh for 30 seconds by default; a feature may supply `staleTime`.
- Only normalized `Server`/`Unknown` errors receive at most two automatic retries.
  Other errors do not retry. Mutations never retry automatically; final commands have
  their separate operation-ID protocol.
- Query functions receive cancellation signals. Window focus does not trigger refetch.
- `refetch()` returns `QueryRefreshResult<T>`: `{ ok: true, data }` or `{ ok: false, error }`.
  For selected queries, data is the selected value; for infinite queries, it is the flat
  item list. No observer or pagination metadata escapes.
- A failed refresh may leave old data visible in `data`/`items`; that cached data does
  not make the refresh result successful. Inspect `ok` for the outcome of this attempt.

## Final commands

- `useFinalCommand` tracks the server operation separately from local follow-up work.
  After a confirmed response, `state` stays `succeeded` and `submit()` resolves to the result,
  even if invalidation or `onSuccess` rejects. Inspect `completionErrors` for those failures.
- Failed invalidation does not skip `onSuccess`. Neither local failure causes a command replay;
  `retry()` after confirmed success does not send anything. A new explicit `submit()` starts a new action.
- `busy` includes local follow-up. Concurrent submit/retry calls share one in-flight action;
  `reset()` is ignored until it finishes. Screens must disable the original submit after success.
- A lost response gets one automatic replay with the same operation ID, then becomes `unknown`.
  Explicit cancellation also remains `unknown`, with no automatic replay: abort does not prove rollback.
  Unmounting stops subsequent replay and success callbacks. Already-running callbacks cannot be cancelled.

## Checks

Run `pnpm --filter @dukani/data test` and `pnpm --filter @dukani/data typecheck`.
