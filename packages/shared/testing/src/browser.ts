import { setupWorker } from 'msw/browser';
import { createMockDb } from './db/mock-db';
import { createHandlers } from './handlers';
import { configureMocks, type MockOptions } from './msw/route';

/**
 * Starts the mock backend in the browser (NEXT_PUBLIC_API_MODE=mock). State persists in localStorage;
 * `window.__dukaniMock.reset()` restores FIXTURE-01.
 */
export const startMockApi = async (opts: MockOptions & { serviceWorkerUrl?: string } = {}) => {
  configureMocks(opts);
  const db = createMockDb({ storage: window.localStorage });
  const worker = setupWorker(...createHandlers(db));
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    serviceWorker: { url: opts.serviceWorkerUrl ?? '/mockServiceWorker.js' },
  });
  (window as unknown as { __dukaniMock: unknown }).__dukaniMock = { db, reset: () => db.reset() };
  return { db, worker };
};
