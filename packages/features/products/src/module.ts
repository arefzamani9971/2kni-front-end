import type { Api } from '@dukani/http';
import { createModuleContext, createMemoryDraftStore, type DraftStore } from '@dukani/platform';
import { createShortcutDrafts } from './infrastructure/shortcut-draft-store';

import { createHttpProductRepository } from './infrastructure/http-product-repository';
import type { ProductsModule } from './module.types';

export const createProductsModule = (deps: {
  api: Api;
  drafts?: DraftStore;
  userId?: () => string;
}): ProductsModule => ({
  shortcutDrafts: createShortcutDrafts(
    deps.drafts ?? createMemoryDraftStore(),
    deps.userId ?? (() => 'anonymous'),
  ),
  products: createHttpProductRepository(deps.api),
});

export const [ProductsModuleProvider, useProductsModule] = createModuleContext<ProductsModule>('products');
