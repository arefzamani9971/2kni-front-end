import type { CoreServices } from '@dukani/app-core';
import type { AuthModule } from '@dukani/auth';
import type { ProductEntryModule } from '@dukani/product-entry';
import type { ProductsModule } from '@dukani/products';
import type { PurchasingModule } from '@dukani/purchasing';
import type { ReportsModule } from '@dukani/reports';
import type { StoreModule } from '@dukani/store';

/** Seller composition root: core services + one module per feature. The only place adapters are chosen. */
export type SellerContainer = CoreServices & {
  readonly modules: {
    readonly auth: AuthModule;
    readonly store: StoreModule;
    readonly reports: ReportsModule;
    readonly productEntry: ProductEntryModule;
    readonly products: ProductsModule;
    readonly purchasing: PurchasingModule;
  };
};
