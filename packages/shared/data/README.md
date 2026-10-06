# Application data facade

Features import only `@dukani/data`. TanStack implementation details remain in
`src/adapters/tanstack`; familiar status flags are retained for existing screens.
Replacing the adapter requires passing the behavioral contract tests, not just matching types.

## Client and cache

- `createDataClient(): DataClient` creates an opaque handle. Pass it to `DataProvider`
  when sharing a cache explicitly, or omit `client` for one cache per provider.
- The provider captures its client on mount. Remount to replace the client; changing
  the prop does not replace it. This is not automatic session isolation.
- `useQueryCache()` returns a stable object with typed `get` and `set`; `set` returns
  void. `useInvalidate()` invalidates by key prefix and awaits refetch of active queries.
- `createQueryKeys(scope)(storeId?)` retains existing key shapes. Callers are responsible
  for including the appropriate store; user/session scoping is a separate follow-up.

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

## Migration in phase 3

- Replace public `createQueryClient` with `createDataClient`. The native QueryClient
  is private to the adapter and cannot be configured through the public handle.
- `refetch` no longer resolves to an unspecified native result.
- Unused `placeholderData` was removed instead of keeping its unsafe `as never` adapter cast.
- Successful mutation invalidation and callback semantics remain unchanged. Session
  cleanup, refresh-token errors, and post-command callback failure handling remain follow-ups.

Run `pnpm --filter @dukani/data test` and `pnpm --filter @dukani/data typecheck`.
Tests cover client/cache isolation, refresh failures with stale data, selection, pagination,
key scopes, cancellation, targeted invalidation, and read/mutation retry behavior.
