import { http, HttpResponse } from 'msw';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db';
import { MockProblem, problemResponse } from '../msw/problem';

const MAX_IMAGE = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/**
 * BCR-13 (proposed, not yet in OpenAPI): `POST /api/v1/stores/{storeId}/files` → `{ fileId, url, contentType, size }`.
 * Untyped until the backend publishes it; the frontend reaches it only through the `FileUploader` port.
 */
export const fileHandlers = (db: MockDb) => [
  http.post('*/api/v1/stores/:storeId/files', async ({ request, params }) => {
    try {
      db.requireMember(request, String(params.storeId));
      const form = await request.formData();
      const file = form.get('File') ?? form.get('file');
      if (!(file instanceof File)) throw new MockProblem(400, 'VALIDATION_FAILED', 'فایل انتخاب نشده است.', { file: ['فایل انتخاب نشده است.'] });
      if (!ALLOWED.includes(file.type)) throw new MockProblem(400, 'FILE_TYPE_NOT_ALLOWED', 'فقط تصویر JPG، PNG، WebP یا PDF مجاز است.');
      if (file.size > MAX_IMAGE) throw new MockProblem(400, 'FILE_TOO_LARGE', 'حجم فایل بیشتر از ۱۰ مگابایت است.');
      const id = randomId();
      db.mutate((s) => s.files.push({ id, storeId: String(params.storeId), name: file.name, contentType: file.type, size: file.size, createdAt: new Date().toISOString() }));
      return HttpResponse.json({ fileId: id, url: null, contentType: file.type, size: file.size });
    } catch (e) {
      if (e instanceof MockProblem) return problemResponse(e);
      throw e;
    }
  }),
];
