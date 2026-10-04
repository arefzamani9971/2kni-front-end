import type { Dto } from '@dukani/contracts';
import { CLOSED_PRESETS, DAYS_PRESETS } from './store-draft.constants';
import type { StoreDraft, StoreHoursPlan, StorePrivateDraft } from './store-draft.types';

/** Anything for `PUT /profile` beyond name/type/mode (contact, address, location, hours). */
export const hasPublicInfo = (d: StoreDraft): boolean =>
  !!d.location ||
  !!d.hours ||
  !!(d.contact && (d.contact.phone || d.contact.email || d.contact.addressLine || d.contact.postalCode));

export const hasPrivateInfo = (p: StorePrivateDraft | null): p is StorePrivateDraft =>
  !!p && Object.values(p).some((v) => v !== null);

/** A closing time before the opening time means the shop is open past midnight (F02 §6). */
export const isOvernight = (h: Pick<StoreHoursPlan, 'opens' | 'closes'>): boolean => h.closes < h.opens;

/** Days that are both «open» and «closed» — the plan is contradictory. */
export const closedOverlap = (h: StoreHoursPlan) =>
  CLOSED_PRESETS[h.closed].days.filter((d) => DAYS_PRESETS[h.days].days.includes(d));

const wireTime = (hhmm: string) => `${hhmm}:00`;

/**
 * Opening hours rows: open days with times, chosen days off as `closed`, other days left unset —
 * «closed» and «not set yet» stay different (F02 §6).
 */
export const toOpeningHours = (h: StoreHoursPlan): Dto<'OpeningHoursDto'>[] => {
  const closed = CLOSED_PRESETS[h.closed].days;
  const open = DAYS_PRESETS[h.days].days.filter((d) => !closed.includes(d));
  return [
    ...open.map((day) => ({ day, opens: wireTime(h.opens), closes: wireTime(h.closes), closed: false })),
    ...closed.map((day) => ({ day, opens: null, closes: null, closed: true })),
  ];
};

/**
 * `PUT /profile` is a full replace (F02 §9): every field comes from the canonical store, the draft only
 * overrides what the user filled in, so nothing is cleared by accident (Skip never sends empties).
 */
export const toProfileRequest = (store: Dto<'StoreDto'>, d: StoreDraft): Dto<'UpdateStoreProfileRequest'> => {
  const c = d.contact;
  const address = store.address ?? null;
  const line = c?.addressLine ?? address?.line ?? null;
  const postalCode = c?.postalCode ?? address?.postalCode ?? null;
  const latitude = d.location ? d.location.lat : (address?.latitude ?? null);
  const longitude = d.location ? d.location.lng : (address?.longitude ?? null);
  const hasAddress = !!(address?.province || address?.city || line || postalCode || latitude !== null);
  return {
    name: store.name,
    storeTypeId: store.storeType.id,
    businessMode: store.businessMode ?? null,
    phone: c?.phone ?? store.phone ?? null,
    email: c?.email ?? store.email ?? null,
    address: hasAddress
      ? {
          province: address?.province ?? null,
          city: address?.city ?? null,
          line,
          postalCode,
          latitude,
          longitude,
        }
      : null,
    openingHours: d.hours ? toOpeningHours(d.hours) : [...store.openingHours],
    logoFileId: store.logoFileId ?? null,
  };
};

export const toPrivateRequest = (p: StorePrivateDraft): Dto<'StorePrivateInfoDto'> => ({
  ownerName: p.ownerName,
  licenseNo: p.licenseNo,
  nationalId: p.nationalId,
  accountNumber: p.accountNumber,
  cardNumber: p.cardNumber,
  iban: p.iban,
});

/** «شنبه تا پنجشنبه · ۰۹:۰۰ تا ۲۱:۰۰» summary for the contact step field. */
export const describeHours = (h: StoreHoursPlan, digits: (s: string) => string): string =>
  `${DAYS_PRESETS[h.days].label} · ${digits(h.opens)} تا ${digits(h.closes)}${isOvernight(h) ? ' (روز بعد)' : ''}`;
