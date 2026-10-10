import { renderHook } from '@testing-library/react';
import { appError } from '@dukani/domain';
import { useDuplicateMatch } from './use-duplicate-match';

const rows = [
  { id: 'a', name: 'کیف', scope: 'g1' },
  { id: 'b', name: 'کیف', scope: 'g2' },
];
const query = vi.hoisted(() => ({ enabled: [] as boolean[] }));
vi.mock('./use-catalog-query', () => ({
  useCatalogQuery: (_key: unknown, _load: unknown, enabled: boolean) => {
    query.enabled.push(enabled);
    return { data: enabled ? rows : undefined };
  },
}));
const conflict = appError('Conflict', 'PRODUCT_TYPE_DUPLICATE', 'x');
const options = (
  current: { name: string; scope: string | null },
  error: ReturnType<typeof appError> | null,
) => ({
  kind: 'type',
  error,
  code: 'PRODUCT_TYPE_DUPLICATE',
  current,
  load: async () => rows,
  scopeOf: (row: (typeof rows)[number]) => row.scope,
});

describe('duplicate match after a conflict', () => {
  it('finds the record with the submitted normalized name in the submitted scope', () => {
    const { result } = renderHook(() => useDuplicateMatch(options({ name: ' كيف ', scope: 'g2' }, conflict)));
    expect(result.current?.id).toBe('b');
  });
  it('offers nothing for other errors', () => {
    const other = appError('Server', 'HTTP_500', 'x');
    const { result } = renderHook(() => useDuplicateMatch(options({ name: 'کیف', scope: 'g1' }, other)));
    expect(result.current).toBeNull();
  });
  it('withdraws the offer once the seller edits the name or the group', () => {
    const { result, rerender } = renderHook(
      (props: { name: string; scope: string | null }) => useDuplicateMatch(options(props, conflict)),
      { initialProps: { name: 'کیف', scope: 'g1' } },
    );
    expect(result.current?.id).toBe('a');
    rerender({ name: 'کیف چرمی', scope: 'g1' });
    expect(result.current).toBeNull();
    rerender({ name: 'کیف', scope: 'g2' });
    expect(result.current).toBeNull();
  });
});
