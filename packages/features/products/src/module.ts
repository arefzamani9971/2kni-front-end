import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';

import { createHttpProductRepository } from './infrastructure/http-product-repository';
import type { ProductsModule } from './module.types';

export const createProductsModule = (deps: { api: Api }): ProductsModule => ({
  products: createHttpProductRepository(deps.api),
});

export const [ProductsModuleProvider, useProductsModule] = createModuleContext<ProductsModule>('products');
