/** Products feature (scope:seller): store product list and detail (F15). */
export { createProductsModule, ProductsModuleProvider, useProductsModule } from './module';
export { type ProductsModule } from './module.types';
export type { ProductRepository } from './application/ports';
export { parseFilter } from './domain/product';
export { type ProductFilter } from './domain/product.types';
export { productKeys } from './ui/hooks/product-keys';
export { useProduct } from './ui/hooks/use-product';
export { useProductList } from './ui/hooks/use-product-list';
export { ProductsScreen } from './ui/screens/ProductsScreen';
export { ProductDetailScreen } from './ui/screens/ProductDetailScreen';
