import type { StoreOpeningHours } from './store-profile-model.types';
import type { BusinessMode } from './store.types';

/**
 * What one F03 edit screen changes. A missing key is «untouched» and keeps the latest server value; `null` is
 * an intentional clear (F03-S18). `PUT /profile` is a full replace, so a patch is always merged onto the store.
 */
export type ProfilePatch = {
  readonly name?: string;
  readonly storeTypeId?: string;
  readonly businessMode?: BusinessMode | null;
  readonly phone?: string | null;
  readonly email?: string | null;
  readonly addressLine?: string | null;
  readonly postalCode?: string | null;
  /** Latitude and longitude always change together; `null` removes the location (explicit action). */
  readonly location?: { readonly lat: number; readonly lng: number } | null;
  readonly openingHours?: readonly StoreOpeningHours[];
};

/** STORE-04 read model: display lines only, each null when the store has no value (never a fake placeholder). */
export type StoreInfoView = {
  readonly name: string;
  readonly typeName: string;
  readonly businessMode: string | null;
  readonly address: string | null;
  readonly contact: string | null;
  readonly postalAndHours: string | null;
};
