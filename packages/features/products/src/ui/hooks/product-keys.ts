import { createQueryKeys } from '@dukani/data';

/** Same scope as other features invalidate (`['products', storeId]`) after entry/purchase. */
export const productKeys = createQueryKeys('products');
