import { createCoreServices } from '@dukani/app-core';
import { createAuthModule } from '@dukani/auth';
import { compose, createFetchAdapter, withErrorMapping } from '@dukani/http';
import { createWebStorage, type PublicEnv } from '@dukani/platform';
import { customerRoutes } from '@dukani/routes';
import type { CustomerContainer } from './container.types';

export const createCustomerContainer = (env: PublicEnv): CustomerContainer => {
  const core = createCoreServices(env, {
    onSessionExpired: () => {
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login'))
        window.location.assign(customerRoutes.login(window.location.pathname));
    },
  });
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
        // customer sign-in frames (Figma 20b/20) use the card layout
        layout: 'cards',
      }),
    },
  };
};
