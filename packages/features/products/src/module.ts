import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';
import type { ProductRepository } from './application/ports';
import { createHttpProductRepository } from './infrastructure/http-product-repository';

export type ProductsModule = { readonly products: ProductRepository };

export const createProductsModule = (deps: { api: Api }): ProductsModule => ({ products: createHttpProductRepository(deps.api) });

export const [ProductsModuleProvider, useProductsModule] = createModuleContext<ProductsModule>('products');
