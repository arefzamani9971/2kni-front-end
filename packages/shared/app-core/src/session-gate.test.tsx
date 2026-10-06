// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemorySession, createMemoryStorage } from '@dukani/platform';
import type * as Platform from '@dukani/platform';
import { SessionGate } from './session-gate';
import { restoreOnce } from './restore-once';

const { navigation } = vi.hoisted(() => ({ navigation: { replace: vi.fn() } }));
const { replace } = navigation;
vi.mock('@dukani/platform', async (load) => ({
  ...(await load<typeof Platform>()),
  useNavigation: () => navigation,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('shows a retry after temporary restore failure, without redirecting to login', async () => {
  const session = createMemorySession(createMemoryStorage());
  const restore = vi.spyOn(session, 'restore').mockRejectedValueOnce(new Error('offline'));
  render(
    <SessionGate
      session={session}
      loginHref={() => '/login'}
      fallback={<span>loading</span>}
      restoreError={(retry) => <button onClick={retry}>retry</button>}
    >
      <span>private</span>
    </SessionGate>,
  );
  const retry = await screen.findByText('retry');
  expect(replace).not.toHaveBeenCalled();
  fireEvent.click(retry);
  await waitFor(() => expect(restore).toHaveBeenCalledTimes(2));
  await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
});

it('does not share restore flights between different session instances', async () => {
  const a = createMemorySession(createMemoryStorage());
  const b = createMemorySession(createMemoryStorage());
  const first = vi.spyOn(a, 'restore');
  const second = vi.spyOn(b, 'restore');
  await Promise.all([restoreOnce(a), restoreOnce(b)]);
  expect(first).toHaveBeenCalledTimes(1);
  expect(second).toHaveBeenCalledTimes(1);
});
