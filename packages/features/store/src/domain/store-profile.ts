import type { Dto } from '@dukani/contracts';
import { toPersianDigits } from '@dukani/domain';
import { CLOSED_PRESETS, DAYS_PRESETS } from './store-draft.constants';
import type { ClosedPreset, DaysPreset, StoreContactDraft, StoreHoursPlan, StoreLocationDraft, StorePrivateDraft } from './store-draft.types';
import type { ProfilePatch, StoreInfoView } from './store-profile.types';
import { BUSINESS_MODE_TITLES } from './store.constants';

type Store = Dto<'StoreDto'>;
type Hours = Dto<'OpeningHoursDto'>;

const has = <K extends keyof ProfilePatch>(p: ProfilePatch, key: K) => Object.prototype.hasOwnProperty.call(p, key);
const pick = <T>(p: ProfilePatch, key: keyof ProfilePatch, current: T): T => (has(p, key) ? (p[key] as T) : current);

/**
 * `PUT /profile` body = latest store + patch (F03 §8). Untouched fields keep the server value — never null by
 * accident — and the version is the one of `store`, so an edit made on an older copy is a 409, not a silent overwrite.
 */
export const applyProfilePatch = (store: Store, patch: ProfilePatch): Dto<'UpdateStoreProfileRequest'> => {
  const a = store.address ?? null;
  const location = has(patch, 'location')
    ? patch.location
    : a?.latitude != null && a.longitude != null
      ? { lat: a.latitude, lng: a.longitude }
      : null;
  const line = pick(patch, 'addressLine', a?.line ?? null);
  const postalCode = pick(patch, 'postalCode', a?.postalCode ?? null);
  const province = a?.province ?? null;
  const city = a?.city ?? null;
  const hasAddress = !!(province || city || line || postalCode || location);
  return {
    name: pick(patch, 'name', store.name),
    storeTypeId: pick(patch, 'storeTypeId', store.storeType.id),
    businessMode: pick(patch, 'businessMode', store.businessMode ?? null),
    phone: pick(patch, 'phone', store.phone ?? null),
    email: pick(patch, 'email', store.email ?? null),
    address: hasAddress
      ? { province, city, line, postalCode, latitude: location?.lat ?? null, longitude: location?.lng ?? null }
      : null,
    openingHours: [...pick(patch, 'openingHours', store.openingHours)],
    logoFileId: store.logoFileId ?? null,
    expectedVersion: store.version,
  };
};

export const contactFromStore = (s: Store): StoreContactDraft => ({
  phone: s.phone ?? null,
  email: s.email ?? null,
  addressLine: s.address?.line ?? null,
  postalCode: s.address?.postalCode ?? null,
});

export const locationFromStore = (s: Store): StoreLocationDraft | null =>
  s.address?.latitude != null && s.address.longitude != null ? { lat: s.address.latitude, lng: s.address.longitude } : null;

/** The contact step shows all four fields, so all four are its patch: an emptied field is a clear (F03-S18). */
export const contactFields = (c: StoreContactDraft): ProfilePatch => ({
  phone: c.phone,
  email: c.email,
  addressLine: c.addressLine,
  postalCode: c.postalCode,
});

const hhmm = (t: string | null | undefined) => (t ?? '').slice(0, 5);
const sameDays = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((d) => b.includes(d));

/**
 * Saved rows → the storehours plan (Figma 594:6767), when the rows are one of its presets. Rows the plan cannot
 * express (different times per day) give null: the step then starts from its defaults instead of guessing.
 */
export const hoursPlanFromRows = (rows: readonly Hours[]): StoreHoursPlan | null => {
  const open = rows.filter((r) => !r.closed);
  const closedDays = rows.filter((r) => r.closed).map((r) => r.day);
  if (!open.length) return null;
  const opens = hhmm(open[0]!.opens);
  const closes = hhmm(open[0]!.closes);
  if (open.some((r) => hhmm(r.opens) !== opens || hhmm(r.closes) !== closes)) return null;
  const closed = (Object.keys(CLOSED_PRESETS) as ClosedPreset[]).find((k) => sameDays(CLOSED_PRESETS[k].days, closedDays));
  if (!closed) return null;
  const days = (Object.keys(DAYS_PRESETS) as DaysPreset[]).find((k) =>
    sameDays(
      DAYS_PRESETS[k].days.filter((d) => !closedDays.includes(d)),
      open.map((r) => r.day),
    ),
  );
  return days ? { days, opens, closes, closed } : null;
};

/** «۹ تا ۲۱» (whole hours without minutes, like Figma STORE-04); null when the days differ or nothing is set. */
export const describeOpeningTimes = (rows: readonly Hours[]): string | null => {
  const open = rows.filter((r) => !r.closed && r.opens && r.closes);
  if (!open.length) return null;
  const first = open[0]!;
  if (open.some((r) => hhmm(r.opens) !== hhmm(first.opens) || hhmm(r.closes) !== hhmm(first.closes))) return null;
  const short = (t: string) => (t.endsWith(':00') ? String(Number(t.slice(0, 2))) : t);
  return toPersianDigits(`${short(hhmm(first.opens))} تا ${short(hhmm(first.closes))}`);
};

const join = (parts: readonly (string | null | undefined)[], sep: string) => {
  const kept = parts.filter((p): p is string => !!p && !!p.trim());
  return kept.length ? kept.join(sep) : null;
};

/** STORE-04 (Figma 385:6853) lines from the public profile. */
export const storeInfoView = (s: Store): StoreInfoView => {
  const contact = join([s.phone ? toPersianDigits(s.phone) : null, s.email], ' · ');
  const hours = describeOpeningTimes(s.openingHours);
  return {
    name: s.name,
    typeName: s.storeType.name,
    businessMode: s.businessMode ? BUSINESS_MODE_TITLES[s.businessMode] : null,
    address: join([s.address?.city, s.address?.line], '، '),
    contact: contact ? `تماس: ${contact}` : null,
    postalAndHours: join(
      [
        s.address?.postalCode ? `کد پستی: ${toPersianDigits(s.address.postalCode)}` : null,
        hours ? `ساعت کاری: ${hours}` : null,
      ],
      ' · ',
    ),
  };
};

export const privateFromDto = (p: Dto<'StorePrivateInfoDto'>): StorePrivateDraft => ({
  ownerName: p.ownerName ?? null,
  licenseNo: p.licenseNo ?? null,
  nationalId: p.nationalId ?? null,
  accountNumber: p.accountNumber ?? null,
  cardNumber: p.cardNumber ?? null,
  iban: p.iban ?? null,
});
