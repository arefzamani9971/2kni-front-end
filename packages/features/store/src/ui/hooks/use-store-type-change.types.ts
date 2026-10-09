import type { StoreTypeChangePreview } from '../../application/ports';
import type { ProfilePatch } from '../../domain/store-profile.types';
export type PendingTypeChange = { patch: ProfilePatch; data: StoreTypeChangePreview };
