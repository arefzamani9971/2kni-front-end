import { render } from '@dukani/i18n/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, createDataClient } from '@dukani/data';
import { appError, PERMISSIONS } from '@dukani/domain';
import { ActiveStoreProvider, createMemoryDraftStore, type ActiveStore } from '@dukani/platform';
import type { CatalogPort } from '../../application/catalog-port.types';
import type { CatalogEditorStore } from '../../application/editor-store.types';
import type { CatalogCategory } from '../../domain/catalog.types';
import { createCommandJournal } from '../../infrastructure/command-journal';
import { CatalogModuleProvider } from '../../module';
import type { CatalogModule } from '../../module.types';
import { CreateCategoryForm } from './CreateCategoryForm';

const STORE: ActiveStore = {
  id: 'store-1',
  name: 'دکان',
  storeTypeKey: 'stationery',
  role: 'Owner',
  permissions: [...PERMISSIONS],
};
const EXISTING: CatalogCategory = {
  id: 'cat-1',
  name: 'نوشت‌افزار',
  parentId: null,
  sort: 0,
  status: 'Private',
  productTypeCount: 0,
  productCount: 0,
  children: [],
};

const setup = (catalog: Partial<CatalogPort>) => {
  const saved = new Map<string, unknown>();
  const editors: CatalogEditorStore = {
    read: async <T,>(_s: string, id: string) => (saved.get(id) as T | undefined) ?? null,
    write: vi.fn(async (_s: string, id: string, value: unknown) => void saved.set(id, value)),
    remove: async (_s: string, id: string) => void saved.delete(id),
  };
  const module = {
    catalog: catalog as CatalogPort,
    corrections: {} as CatalogModule['corrections'],
    journal: createCommandJournal(createMemoryDraftStore(), () => 'user'),
    editors,
  } satisfies CatalogModule;
  const onCreated = vi.fn();
  render(
    <DataProvider client={createDataClient()}>
      <ActiveStoreProvider value={STORE}>
        <CatalogModuleProvider value={module}>
          <CreateCategoryForm
            draftId="test"
            initialName=""
            categories={[EXISTING]}
            onCreated={onCreated}
            onCancel={vi.fn()}
            present={(content, actions) => (
              <>
                {content}
                {actions}
              </>
            )}
          />
        </CatalogModuleProvider>
      </ActiveStoreProvider>
    </DataProvider>,
  );
  return { writes: editors.write as ReturnType<typeof vi.fn>, saved, onCreated };
};

describe('category form (F05) on the shared form infrastructure', () => {
  it('keeps the typed draft with a burst write, not one write per key', async () => {
    const user = userEvent.setup();
    const { writes, saved } = setup({});
    await user.type(await screen.findByLabelText(/عنوان/), 'لوازم تحریر');
    await waitFor(() => expect(saved.get('category:test')).toEqual({ name: 'لوازم تحریر', parentId: '' }));
    expect(writes.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it('a duplicate conflict offers the existing group until the name is edited, and can reuse it', async () => {
    const user = userEvent.setup();
    const { onCreated } = setup({
      createCategory: vi.fn(async () => {
        throw appError('Conflict', 'CATEGORY_DUPLICATE', 'duplicate');
      }),
      categories: async () => [EXISTING],
    });
    const name = await screen.findByLabelText(/عنوان/);
    await user.type(name, 'نوشت‌افزار');
    await user.click(screen.getByRole('button', { name: 'ثبت گروه' }));
    const reuse = await screen.findByRole('button', { name: 'استفاده از مورد موجود' });
    await user.type(name, ' ۲');
    await waitFor(() => expect(reuse).not.toBeInTheDocument());
    await user.type(name, '{Backspace}{Backspace}');
    await user.click(await screen.findByRole('button', { name: 'استفاده از مورد موجود' }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(EXISTING));
  });
});
