import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { StoreGate } from './StoreGate';

vi.mock('./hooks/use-store', () => ({
  useStore: (id: string) => ({ data: { id, name: id, storeTypeKey: null, role: 'Owner', permissions: [] } }),
}));

it('resets descendant local state when switching stores', () => {
  function Editor() {
    const store = useActiveStore();
    const [editingStore] = useState(store.id);
    return <span>{editingStore}</span>;
  }
  const { rerender } = render(
    <StoreGate storeId="first" onLeave={() => undefined}>
      <Editor />
    </StoreGate>,
  );
  expect(screen.getByText('first')).toBeDefined();
  rerender(
    <StoreGate storeId="second" onLeave={() => undefined}>
      <Editor />
    </StoreGate>,
  );
  expect(screen.queryByText('first')).toBeNull();
  expect(screen.getByText('second')).toBeDefined();
});
