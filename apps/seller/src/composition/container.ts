import { createCoreServices } from '@dukani/app-core';
import { createAuthModule } from '@dukani/auth';
import { compose, createFetchAdapter, withErrorMapping } from '@dukani/http';
import { createWebStorage, type PublicEnv } from '@dukani/platform';
import { createProductEntryModule } from '@dukani/product-entry';
import { createProductsModule } from '@dukani/products';
import { createPurchasingModule } from '@dukani/purchasing';
import { createReportsModule } from '@dukani/reports';
import { createStoreModule } from '@dukani/store';
import { sellerRoutes } from '@dukani/routes';
import type { SellerContainer } from './container.types';

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
      auth: createAuthModule({
        mode: env.apiMode,
        api: core.api,
        sameOriginHttp,
        session: core.session,
        storage: createWebStorage('session'),
        // the composition root owns build-mode decisions; features never read process.env (F01-S16)
        showDevCode: process.env.NODE_ENV !== 'production',
      }),
      store: createStoreModule({ api: core.api, drafts: core.drafts, userId }),
      reports: createReportsModule({ api: core.api }),
      productEntry: createProductEntryModule({ api: core.api, drafts: core.drafts, userId }),
      products: createProductsModule({ api: core.api }),
      purchasing: createPurchasingModule({ api: core.api, http: core.http }),
    },
  };
};
