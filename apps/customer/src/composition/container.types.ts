import type { CoreServices } from '@dukani/app-core';
import type { AuthModule } from '@dukani/auth';

/** Customer composition root (1.2 mobile). Buyer features plug in here as they are built. */
export type CustomerContainer = CoreServices & { readonly modules: { readonly auth: AuthModule } };
