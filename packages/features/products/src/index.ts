/** Products feature (scope:seller): store product list and detail (F15). */
export { createProductsModule, ProductsModuleProvider, useProductsModule, type ProductsModule } from './module';
export type { ProductRepository } from './application/ports';
export { parseFilter, type ProductFilter } from './domain/product';
export { productKeys, useProduct, useProductList } from './ui/hooks/use-products';
export { ProductsScreen } from './ui/screens/ProductsScreen';
export { ProductDetailScreen } from './ui/screens/ProductDetailScreen';
