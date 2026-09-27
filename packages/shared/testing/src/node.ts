import { setupServer } from 'msw/node';
import { createMockDb } from './db/mock-db';
import { createHandlers } from './handlers';
import { configureMocks, resetReplays } from './msw/route';

/** Mock backend for Vitest (Node): fresh FIXTURE-01 state per `reset()`, no latency. */
export const createMockServer = (opts: { baseUrl?: string } = {}) => {
  configureMocks({ latency: 'none', baseUrl: opts.baseUrl ?? '*' });
  const db = createMockDb();
  const server = setupServer(...createHandlers(db));
  return {
    db,
    server,
    reset() {
      db.reset();
      resetReplays();
      server.resetHandlers();
    },
  };
};
