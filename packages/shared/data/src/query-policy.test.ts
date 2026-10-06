import { appError, type AppErrorKind } from '@dukani/domain';
import { shouldRetryRead } from './query-policy';

describe('read retry policy', () => {
  it.each<AppErrorKind>(['Server', 'Unknown'])('retries %s twice at most', (kind) => {
    const error = appError(kind, 'TEST', 'test');
    expect([0, 1, 2, 3].map((count) => shouldRetryRead(count, error))).toEqual([true, true, false, false]);
  });
  it.each<AppErrorKind>([
    'Validation',
    'Unauthorized',
    'Blocked',
    'Permission',
    'NotFound',
    'Conflict',
    'BusinessRule',
    'NotReleased',
    'Offline',
    'Bug',
  ])('does not retry %s', (kind) => {
    expect(shouldRetryRead(0, appError(kind, 'TEST', 'test'))).toBe(false);
  });
  it('does not retry unexpected exceptions', () => {
    expect(shouldRetryRead(0, new Error('bug'))).toBe(false);
  });
});
