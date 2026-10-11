import type { ProductStatus } from './product.types';

type Product = { readonly status: ProductStatus };

/** Archive stops new sales and purchases; history stays (F11 §8). */
export const isArchived = (p: Product) => p.status === 'Archived';

/** Local edits and new stock need an active product; an archived one is restored first (F11 §10.7). */
export const canEditLocally = (p: Product) => !isArchived(p);
