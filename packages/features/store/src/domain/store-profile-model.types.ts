import type { BusinessMode } from './store.types';

/** Feature-owned models. Wire DTOs and optional JSON fields belong to infrastructure only. */
export type StoreType = { readonly id: string; readonly key: string; readonly name: string };
export type Weekday = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type StoreAddress = {
  readonly province: string | null;
  readonly city: string | null;
  readonly line: string | null;
  readonly postalCode: string | null;
  readonly latitude: number | null;
  readonly longitude: number | null;
};

export type StoreOpeningHours = {
  readonly day: Weekday;
  readonly opens: string | null;
  readonly closes: string | null;
  readonly closed: boolean;
};

export type StoreProfile = {
  readonly id: string;
  readonly name: string;
  readonly storeType: StoreType;
  readonly businessMode: BusinessMode | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: StoreAddress | null;
  readonly openingHours: readonly StoreOpeningHours[];
  readonly logoFileId: string | null;
  readonly logoUrl: string | null;
  readonly version: number;
};

/** Complete editable snapshot, paired with the version the user actually read. */
export type StoreProfileUpdate = {
  readonly name: string;
  readonly storeTypeId: string;
  readonly businessMode: BusinessMode | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: StoreAddress | null;
  readonly openingHours: readonly StoreOpeningHours[];
  readonly logoFileId: string | null;
  readonly version: number;
};

export type StorePrivateInfo = {
  readonly ownerName: string | null;
  readonly nationalId: string | null;
  readonly licenseNo: string | null;
  readonly iban: string | null;
  readonly cardNumber: string | null;
  readonly accountNumber: string | null;
  readonly version: number | null;
};

export type StoreTypeChangePreview = {
  readonly newStoreTypeId: string;
  readonly productsKept: number;
  readonly categoriesNoLongerSuggested: readonly string[];
};
