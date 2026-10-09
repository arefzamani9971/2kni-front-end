import { waitForRetry } from './wait-for-retry';
import { withRetry } from './with-retry';
import { NetworkError } from '../network-error';
describe('retry cancellation', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('rejects an already-aborted wait without creating a timer', async () => {
    const abort = new AbortController();
    abort.abort();
    await expect(waitForRetry(100, abort.signal)).rejects.toBe(abort.signal.reason);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('removes the abort listener when backoff completes', async () => {
    const abort = new AbortController();
    const add = vi.spyOn(abort.signal, 'addEventListener');
    const remove = vi.spyOn(abort.signal, 'removeEventListener');
    const wait = waitForRetry(100, abort.signal);
    await vi.advanceTimersByTimeAsync(100);
    await wait;
    expect(remove).toHaveBeenCalledWith('abort', add.mock.calls[0]![1]);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('does not send a retry after cancellation during backoff', async () => {
    const abort = new AbortController();
    const request = vi.fn().mockRejectedValue(new NetworkError(false, false, false));
    const retry = withRetry({ baseDelayMs: 100 })({ request });
    const result = retry
      .request({ method: 'GET', path: '/test', signal: abort.signal })
      .catch((error) => error);
    await Promise.resolve();
    abort.abort();
    expect(await result).toBe(abort.signal.reason);
    expect(request).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('does not dispatch an already-aborted request', async () => {
    const abort = new AbortController();
    abort.abort();
    const request = vi.fn();
    await expect(
      withRetry()({ request }).request({ method: 'GET', path: '/', signal: abort.signal }),
    ).rejects.toBe(abort.signal.reason);
    expect(request).not.toHaveBeenCalled();
  });
});
