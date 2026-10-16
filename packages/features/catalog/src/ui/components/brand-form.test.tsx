import { render } from '@dukani/i18n/testing';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataProvider, createDataClient } from '@dukani/data';
import { appError, PERMISSIONS } from '@dukani/domain';
import { ActiveStoreProvider, createMemoryDraftStore, type ActiveStore } from '@dukani/platform';
import type { CatalogPort } from '../../application/catalog-port.types';
import type { CatalogEditorStore } from '../../application/editor-store.types';
import type { CatalogBrand } from '../../domain/catalog.types';
import { createCommandJournal } from '../../infrastructure/command-journal';
import { CatalogModuleProvider } from '../../module';
import type { CatalogModule } from '../../module.types';
import { CreateBrandForm } from './CreateBrandForm';

const STORE: ActiveStore = {
  id: 'store-1',
  name: 'دکان',
  storeTypeKey: 'stationery',
  role: 'Owner',
  permissions: [...PERMISSIONS],
};
const EXISTING: CatalogBrand = { id: 'brand-1', name: 'پنتر', nameEn: null, status: 'Private' };

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
          <CreateBrandForm draftId="test" onCreated={onCreated} onCancel={vi.fn()} />
        </CatalogModuleProvider>
      </ActiveStoreProvider>
    </DataProvider>,
  );
  return { writes: editors.write as ReturnType<typeof vi.fn>, saved, onCreated };
};

describe('brand form (F06) on the shared form infrastructure', () => {
  it('keeps the typed draft with a burst write, not one write per key', async () => {
    const user = userEvent.setup();
    const { writes, saved } = setup({});
    await user.type(await screen.findByLabelText(/نام برند/), 'کنکو ژاپن');
    await waitFor(() => expect(saved.get('brand:test')).toEqual({ name: 'کنکو ژاپن' }));
    expect(writes.mock.calls.length).toBeLessThanOrEqual(3);
  });

  it('a duplicate brand offers the existing one and selects it', async () => {
    const user = userEvent.setup();
    const { onCreated } = setup({
      createBrand: vi.fn(async () => {
        throw appError('Conflict', 'BRAND_DUPLICATE', 'duplicate');
      }),
      brands: async () => [EXISTING],
    });
    await user.type(await screen.findByLabelText(/نام برند/), 'پنتر');
    await user.click(screen.getByRole('button', { name: 'ذخیره و انتخاب برند' }));
    await user.click(await screen.findByRole('button', { name: 'استفاده از مورد موجود' }));
    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(EXISTING));
  });
});
