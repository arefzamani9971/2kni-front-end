/**
 * Mock backend (MSW) for mock mode, Storybook and tests. Handlers are typed against the OpenAPI
 * contract; state lives in an in-memory DB seeded from the backend seed (FIXTURE-01).
 */
export { createMockDb } from './db/mock-db';
export { type MockDb, type MockStorage } from './db/mock-db.types';
export { FIXTURE } from './db/fixtures.constants';
export type { MockState } from './db/state';
export { createHandlers, BLOCKED_MOBILE, SEND_FAILED_MOBILE } from './handlers';
export { route, configureMocks, resetReplays } from './msw/route';
export { type MockOptions, type MockResolver } from './msw/route.types';
export { fail } from './msw/problem';
export { MockProblem } from './msw/mock-problem';
