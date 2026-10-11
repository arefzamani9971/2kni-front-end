import { visibleQueryData } from './visible-query-data';
describe('cached query authorization', () => {
  it('hides private data on denied access while preserving offline data', () => {
    const data = { private: 'cached' };
    expect(
      visibleQueryData(data, { kind: 'Permission', code: 'PERMISSION_DENIED', message: '' }),
    ).toBeUndefined();
    expect(
      visibleQueryData(data, { kind: 'Unauthorized', code: 'UNAUTHORIZED', message: '' }),
    ).toBeUndefined();
    expect(visibleQueryData(data, { kind: 'Offline', code: 'NETWORK', message: '' })).toBe(data);
  });
});
