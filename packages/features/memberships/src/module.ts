import type { Api } from '@dukani/http';
import { createModuleContext } from '@dukani/platform';
import type { MembershipsRepository } from './application/ports';
import { createHttpMembershipsRepository } from './infrastructure/http-repository';

export type MembershipsModule = { readonly memberships: MembershipsRepository };

export const createMembershipsModule = (deps: { api: Api }): MembershipsModule => ({
  memberships: createHttpMembershipsRepository(deps.api),
});

export const [MembershipsModuleProvider, useMembershipsModule] =
  createModuleContext<MembershipsModule>('memberships');
