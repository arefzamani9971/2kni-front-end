import type { Dto } from '@dukani/contracts';
import { PERMISSIONS } from '@dukani/domain';
import { fail } from '../msw/problem';
import { createFixtureState } from './fixtures';
import { seedBrands, seedCatalogItems, seedProductTypes } from './reference';
import type { MemberRecord, MockState, UserRecord } from './state';

const STORAGE_KEY = 'dukani.mock-db.v1';

export type MockStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * In-memory backend state. In the browser it is persisted to localStorage so a demo survives reloads
 * (registered products show up in lists, purchases keep their stock). `reset()` restores FIXTURE-01.
 */
export const createMockDb = (opts: { storage?: MockStorage | null } = {}) => {
  const storage = opts.storage ?? null;
  const load = (): MockState => {
    try {
      const raw = storage?.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MockState;
        if (parsed.schema === 1) return parsed;
      }
    } catch {
      /* corrupted → fixtures */
    }
    return createFixtureState();
  };
  let state = load();
  const save = () => {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota or private mode: keep in memory */
    }
  };

  const db = {
    get state() {
      return state;
    },
    /** Applies a change and persists it. */
    mutate<T>(fn: (s: MockState) => T): T {
      const result = fn(state);
      save();
      return result;
    },
    reset() {
      state = createFixtureState();
      storage?.removeItem(STORAGE_KEY);
    },
    next(storeId: string, name: string): number {
      const key = `${storeId}:${name}`;
      state.sequences[key] = (state.sequences[key] ?? 0) + 1;
      return state.sequences[key];
    },

    // --- reference data (seed + store-created) -----------------------------------
    catalogItems: () => [...seedCatalogItems, ...state.catalogItems],
    productTypes: () => [...seedProductTypes, ...state.productTypes],
    brands: () => [...seedBrands, ...state.brands],

    // --- auth / access -----------------------------------------------------------
    issueAccessToken: (userId: string) => `mock.${userId}.${Date.now() + ACCESS_TOKEN_TTL_MS}`,
    /** Resolves the user from `Authorization: Bearer mock.<userId>.<exp>` or throws 401. */
    requireUser(request: Request): UserRecord {
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
      const [prefix, userId, exp] = token?.split('.') ?? [];
      if (prefix !== 'mock' || !userId || !exp) throw fail.unauthorized();
      if (Number(exp) < Date.now()) throw fail.unauthorized();
      const user = state.users.find((u) => u.id === userId);
      if (!user) throw fail.unauthorized('SESSION_REVOKED');
      return user;
    },
    /** Store member of the current user or 403 STORE_ACCESS_DENIED (backend `StoreAccessFilter`). */
    requireMember(request: Request, storeId: string, permission?: string): { user: UserRecord; member: MemberRecord } {
      const user = db.requireUser(request);
      const member = state.members.find((m) => m.storeId === storeId && m.userId === user.id);
      if (!member) throw fail.forbidden('STORE_ACCESS_DENIED', 'به این فروشگاه دسترسی ندارید.');
      if (permission && member.role !== 'Owner' && !member.permissions.includes(permission)) throw fail.forbidden();
      return { user, member };
    },
    permissionsOf: (m: MemberRecord): string[] => (m.role === 'Owner' ? [...PERMISSIONS] : m.permissions),

    // --- operations (Idempotency-Key results, `GET …/operations/{id}`) ------------
    recordOperation(operationId: string | null, kind: string, resultType: string, resultId: string) {
      if (!operationId) return;
      const now = new Date().toISOString();
      const op: Dto<'OperationStatusDto'> = { operationId, kind, status: 'Succeeded', resultType, resultId, createdAt: now, completedAt: now };
      state.operations = [...state.operations.filter((o) => o.operationId !== operationId), op];
    },
  };
  return db;
};

export type MockDb = ReturnType<typeof createMockDb>;
