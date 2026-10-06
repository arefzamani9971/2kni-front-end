# Application data facade

Features import only `@dukani/data`. TanStack implementation details remain in
`src/adapters/tanstack`; familiar status flags are retained for existing screens.
Replacing the adapter requires passing the behavioral contract tests, not just matching types.

## Client and cache

- `createDataClient(): DataClient` creates an opaque handle. Pass it to `DataProvider`
  when sharing a cache explicitly, or omit `client` for one cache per provider.
- The provider captures an explicit client on mount. Changing that prop does not replace it.
  Alternatively, supply `scopeKey` (without `client`): a scope change creates a new owned
  cache and remounts descendants. The old owned cache is cleared and its requests cancelled
  on disposal; StrictMode effect replay does not dispose a live cache.
- Seller and customer pass the session version as `scopeKey`. Sign-in, sign-out and expiry
  change the version; ordinary token renewal for the same user does not.
- `useQueryCache()` returns a stable object with typed `get` and `set`; `set` returns
  void. `useInvalidate()` invalidates by key prefix and awaits refetch of active queries.
- `createQueryKeys(scope)(storeId?)` retains existing key shapes. Callers are responsible
  for including the appropriate store. StoreGate also remounts its subtree when storeId changes.

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
- Successful mutation invalidation and callback semantics remain unchanged.
  Phase 4 adds session scoping; post-command callback failure handling remains a follow-up.

Run `pnpm --filter @dukani/data test` and `pnpm --filter @dukani/data typecheck`.
Tests cover client/cache isolation, refresh failures with stale data, selection, pagination,
key scopes, cancellation, targeted invalidation, and read/mutation retry behavior.
