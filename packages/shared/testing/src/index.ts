/**
 * Mock backend (MSW) for mock mode, Storybook and tests. Handlers are typed against the OpenAPI
 * contract; state lives in an in-memory DB seeded from the backend seed (FIXTURE-01).
 */
export { createMockDb, type MockDb, type MockStorage } from './db/mock-db';
export { FIXTURE } from './db/fixtures';
export type { MockState } from './db/state';
export { createHandlers, BLOCKED_MOBILE } from './handlers';
export { route, configureMocks, resetReplays, type MockOptions, type MockResolver } from './msw/route';
export { fail, MockProblem } from './msw/problem';
