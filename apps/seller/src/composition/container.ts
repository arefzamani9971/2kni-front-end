import { createCoreServices, type CoreServices } from '@dukani/app-core';
import { createAuthModule, type AuthModule } from '@dukani/auth';
import { compose, createFetchAdapter, withErrorMapping } from '@dukani/http';
import { createWebStorage, type PublicEnv } from '@dukani/platform';
import { createProductEntryModule, type ProductEntryModule } from '@dukani/product-entry';
import { createProductsModule, type ProductsModule } from '@dukani/products';
import { createPurchasingModule, type PurchasingModule } from '@dukani/purchasing';
import { createReportsModule, type ReportsModule } from '@dukani/reports';
import { createStoreModule, type StoreModule } from '@dukani/store';
import { sellerRoutes } from '@dukani/routes';

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

export const createSellerContainer = (env: PublicEnv): SellerContainer => {
  const core = createCoreServices(env, {
    onSessionExpired: () => {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login'))
        window.location.assign(sellerRoutes.login(window.location.pathname));
    },
  });
  const userId = () => {
    const s = core.session.getState();
    return s.status === 'signed-in' ? s.user.id : 'anonymous';
  };
  const sameOriginHttp = compose(createFetchAdapter({ baseUrl: '' }), withErrorMapping);
  return {
    ...core,
    modules: {
      auth: createAuthModule({ mode: env.apiMode, api: core.api, sameOriginHttp, session: core.session, storage: createWebStorage('session') }),
      store: createStoreModule({ api: core.api }),
      reports: createReportsModule({ api: core.api }),
      productEntry: createProductEntryModule({ api: core.api, drafts: core.drafts, userId }),
      products: createProductsModule({ api: core.api }),
      purchasing: createPurchasingModule({ api: core.api, http: core.http }),
    },
  };
};
