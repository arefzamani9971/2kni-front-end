import { createModuleContext } from '@dukani/platform';

import { createApiAuthGateway } from './infrastructure/api-auth-gateway';
import { createBffAuthGateway } from './infrastructure/bff-auth-gateway';
import { createChallengeStore } from './infrastructure/session-challenge-store';
import type { AuthModule, AuthModuleDeps } from './module.types';

/** Composition of the auth feature; the app decides the adapters by mode. */
export const createAuthModule = (deps: AuthModuleDeps): AuthModule => ({
  gateway:
    deps.mode === 'live'
      ? createBffAuthGateway(deps.api, deps.sameOriginHttp)
      : createApiAuthGateway(deps.api),
  challenges: createChallengeStore(deps.storage),
  session: deps.session,
  layout: deps.layout ?? 'split',
  showDevCode: deps.showDevCode ?? false,
});

export const [AuthModuleProvider, useAuthModule] = createModuleContext<AuthModule>('auth');
