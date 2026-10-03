import type { Dto } from '@dukani/contracts';
import {
  parseAccountNumber,
  parseCardNumber,
  parseEmail,
  parseNationalId,
  parsePostalCode,
  parseSheba,
  parseStorePhone,
  type ValidationResult,
} from '@dukani/domain';
import { http, HttpResponse } from 'msw';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import { MockProblem } from '../msw/mock-problem';
import { fail, problemResponse } from '../msw/problem';
import { route } from '../msw/route';
import { toStoreDto } from './dto';
import { ALLOWED_LOGO, MAX_IMAGE } from './files.constants';

const SETTINGS = 'store.settings';

/** Blank → null; otherwise the same parser the backend validator mirrors (400 with the field name). */
const optional = (field: string, raw: string | null | undefined, parse: (s: string) => ValidationResult): string | null => {
  if (raw === null || raw === undefined || raw.trim() === '') return null;
  const r = parse(raw);
  if (!r.ok) throw fail.validation(field, r.error.message);
  return r.value;
};

const text = (field: string, raw: string | null | undefined, max: number) => {
  const s = raw?.trim() ?? '';
  if (s.length > max) throw fail.validation(field, `حداکثر ${max} نویسه.`);
  return s || null;
};

/** Store profile (F02/F03): full-replace `PUT /profile`, `POST /logo`, and the private owner/bank data. */
export const storeProfileHandlers = (db: MockDb) => [
  route.put('/api/v1/stores/{storeId}/profile', ({ request, params, body }) => {
    const { member } = db.requireMember(request, params.storeId, SETTINGS);
    const store = db.state.stores.find((s) => s.id === params.storeId)!;
    const name = body.name?.trim() ?? '';
    if (!name) throw fail.validation('name', 'نام فروشگاه را وارد کنید.');
    const a = body.address ?? null;
    if (a && (a.latitude === null || a.latitude === undefined) !== (a.longitude === null || a.longitude === undefined))
      throw fail.validation('location', 'موقعیت مکانی باید هر دو مقدار عرض و طول را داشته باشد.');
    const hours = body.openingHours ?? [];
    if (new Set(hours.map((h) => h.day)).size !== hours.length)
      throw fail.validation('openingHours', 'ساعت کاری هر روز هفته فقط یک بار وارد می‌شود.');
    // everything is validated before anything changes: a rejected PUT leaves the store as it was
    const phone = optional('phone', body.phone, parseStorePhone);
    const email = optional('email', body.email, parseEmail);
    const address = a
      ? {
          province: text('address.province', a.province, 64),
          city: text('address.city', a.city, 64),
          line: text('address.line', a.line, 400),
          postalCode: optional('address.postalCode', a.postalCode, parsePostalCode),
          latitude: a.latitude ?? null,
          longitude: a.longitude ?? null,
        }
      : null;
    return db.mutate(() => {
      Object.assign(store, {
        name,
        storeTypeId: body.storeTypeId,
        businessMode: body.businessMode ?? null,
        phone,
        email,
        address,
        openingHours: hours.map((h) => (h.closed ? { ...h, opens: null, closes: null } : h)),
        logoFileId: body.logoFileId ?? null,
      });
      return toStoreDto(db, store, member);
    });
  }),

  route.get('/api/v1/stores/{storeId}/private-info', ({ request, params }) => {
    db.requireMember(request, params.storeId, SETTINGS);
    const store = db.state.stores.find((s) => s.id === params.storeId)!;
    return (
      store.privateInfo ?? { ownerName: null, nationalId: null, licenseNo: null, iban: null, cardNumber: null, accountNumber: null }
    );
  }),

  route.put('/api/v1/stores/{storeId}/private-info', ({ request, params, body }) => {
    db.requireMember(request, params.storeId, SETTINGS);
    const store = db.state.stores.find((s) => s.id === params.storeId)!;
    const info: Dto<'StorePrivateInfoDto'> = {
      ownerName: text('ownerName', body.ownerName, 160),
      licenseNo: text('licenseNo', body.licenseNo, 64),
      nationalId: optional('nationalId', body.nationalId, parseNationalId),
      iban: optional('iban', body.iban, parseSheba),
      cardNumber: optional('cardNumber', body.cardNumber, parseCardNumber),
      accountNumber: optional('accountNumber', body.accountNumber, parseAccountNumber),
    };
    return db.mutate(() => (store.privateInfo = info));
  }),

  // multipart: outside the JSON `route()` helper (like `/files`)
  http.post('*/api/v1/stores/:storeId/logo', async ({ request, params }) => {
    try {
      const storeId = String(params.storeId);
      const { member } = db.requireMember(request, storeId, SETTINGS);
      const file = (await request.formData()).get('File');
      if (!(file instanceof File))
        throw new MockProblem(400, 'VALIDATION_FAILED', 'فایل انتخاب نشده است.', { file: ['فایل انتخاب نشده است.'] });
      if (!ALLOWED_LOGO.includes(file.type))
        throw new MockProblem(400, 'FILE_TYPE_NOT_ALLOWED', 'فقط تصویر JPG، PNG یا WebP مجاز است.');
      if (file.size === 0 || file.size > MAX_IMAGE)
        throw new MockProblem(400, 'FILE_TOO_LARGE', 'حجم تصویر باید بیشتر از صفر و حداکثر ۱۰ مگابایت باشد.');
      const store = db.state.stores.find((s) => s.id === storeId)!;
      const id = randomId();
      const dto = db.mutate((s) => {
        s.files.push({ id, storeId, name: file.name, contentType: file.type, size: file.size, createdAt: new Date().toISOString() });
        store.logoFileId = id;
        return toStoreDto(db, store, member);
      });
      return HttpResponse.json(dto);
    } catch (e) {
      if (e instanceof MockProblem) return problemResponse(e);
      throw e;
    }
  }),
];
