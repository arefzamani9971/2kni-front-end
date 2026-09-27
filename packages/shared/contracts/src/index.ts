export * from './generated/schema';
export * from './endpoint-types';

import type { components } from './generated/schema';

/** All API DTO schemas by name, e.g. `Dto<'StoreDto'>`. */
export type Schemas = components['schemas'];
export type Dto<K extends keyof Schemas> = Schemas[K];

/** ProblemDetails (RFC 7807) with the stable `code` used for error mapping. */
export type ProblemDetails = Schemas['ProblemDetails'];

/** Cursor page returned by every list endpoint. */
export type CursorPage<T> = { items: T[]; nextCursor?: string | null; totalCount?: number | null };
