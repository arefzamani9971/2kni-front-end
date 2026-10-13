/** Ports of the memberships feature (one method per backend capability). */
import type { StoreIntroduction, MembershipStatus } from '../domain/membership.types';
export type MembershipsRepository = {
  resolve(code: string, signal?: AbortSignal): Promise<StoreIntroduction>;
  status(code: string, signal?: AbortSignal): Promise<MembershipStatus>;
  join(code: string): Promise<MembershipStatus>;
  grantMarketing(storeId: string): Promise<void>;
};
