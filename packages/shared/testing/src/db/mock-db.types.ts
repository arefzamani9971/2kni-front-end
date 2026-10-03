import type { createMockDb } from './mock-db';

export type MockStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type MockDb = ReturnType<typeof createMockDb>;
