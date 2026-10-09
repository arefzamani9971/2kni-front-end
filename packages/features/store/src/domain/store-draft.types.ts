import type { DAYS_PRESET_VALUES, CLOSED_PRESET_VALUES } from './hours-presets.constants';
import type { BusinessMode } from './store.types';

export type { Weekday } from './store-profile-model.types';

/** Figma storehours (594:6767): one opening time for a range of days, plus optional days off. */
export type DaysPreset = (typeof DAYS_PRESET_VALUES)[number];
export type ClosedPreset = (typeof CLOSED_PRESET_VALUES)[number];

export type StoreHoursPlan = {
  readonly days: DaysPreset;
  /** `HH:mm`; `closes` earlier than `opens` means the store works past midnight. */
  readonly opens: string;
  readonly closes: string;
  readonly closed: ClosedPreset;
};

/** storeprofile «تماس و نشانی» (358:481). Canonical values; null = left empty. */
export type StoreContactDraft = {
  readonly phone: string | null;
  readonly email: string | null;
  readonly addressLine: string | null;
  readonly postalCode: string | null;
};

export type StoreLocationDraft = { readonly lat: number; readonly lng: number };

/** storelegal «اطلاعات مالک و بانکی» (358:482). Never persisted to local drafts or logs (F02 §7). */
export type StorePrivateDraft = {
  readonly ownerName: string | null;
  readonly licenseNo: string | null;
  readonly nationalId: string | null;
  readonly accountNumber: string | null;
  readonly cardNumber: string | null;
  readonly iban: string | null;
};

/**
 * The pending-store draft (F02 §8): required fields, the optional public sections, and the create
 * operation id / created store id so a refresh never creates a second store.
 */
export type StoreDraft = {
  readonly name: string;
  readonly storeTypeId: string;
  readonly businessMode: BusinessMode;
  readonly contact: StoreContactDraft | null;
  readonly location: StoreLocationDraft | null;
  readonly hours: StoreHoursPlan | null;
  /** `Idempotency-Key` of `POST /stores`, saved before the request is sent. */
  readonly operationId: string | null;
  /** Set once the create succeeded; from then on only this store is updated. */
  readonly storeId: string | null;
};

/** Optional sections saved after the create, each with its own result (F02 §8 partial completion). */
export type SetupSection = 'profile' | 'logo' | 'private';
export type SectionState = 'skipped' | 'pending' | 'saving' | 'done' | 'failed';
