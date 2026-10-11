import type { Dto } from '@dukani/contracts';
import { randomId } from '../db/ids';
import type { MockDb } from '../db/mock-db.types';
import { fail } from '../msw/problem';
import { route } from '../msw/route';
import { correctionCapabilities, normalizeProposal } from './correction-capabilities';

type Status = Dto<'CorrectionStatus'>;
const OPEN: Status[] = ['Submitted', 'Reviewing', 'NeedInfo', 'Appealed'];

/** Catalog correction requests of a store (F09, F11): capabilities, create, list, detail, reply, appeal, withdraw. */
export const correctionHandlers = (db: MockDb) => {
  const find = (storeId: string, id: string) => {
    const c = db.state.corrections?.find((x) => x.id === id && x.storeId === storeId);
    if (!c) throw fail.notFound('درخواست اصلاح');
    return c;
  };
  const strip = ({ storeId: _, ...dto }: Dto<'CorrectionRequestDto'> & { storeId: string }) => dto;
  const move = (
    storeId: string,
    id: string,
    to: Status,
    from: Status[],
    note: string | null,
    evidence: string[] = [],
  ) =>
    db.mutate((s) => {
      const c = s.corrections!.find((x) => x.id === id && x.storeId === storeId)!;
      if (!from.includes(c.status)) throw fail.rule('INVALID_STATE_TRANSITION', 'این تغییر وضعیت مجاز نیست.');
      c.status = to;
      c.evidenceFileIds = [...c.evidenceFileIds, ...evidence.filter((e) => !c.evidenceFileIds.includes(e))];
      c.history = [...c.history, { at: new Date().toISOString(), status: to, note }];
      return strip(c);
    });
  const reply = (storeId: string, body: Dto<'CorrectionReplyRequest'>) => {
    const message = body.message?.trim();
    if (!message || message.length > 2000) throw fail.validation('message', 'پیام را وارد کنید.');
    const evidence = body.evidenceFileIds ?? [];
    if (evidence.some((id) => !db.state.files.some((f) => f.id === id && f.storeId === storeId)))
      throw fail.validation(
        'evidenceFileIds',
        'فایل انتخاب‌شده پیدا نشد؛ دوباره بارگذاری کنید.',
        'FILE_NOT_FOUND',
      );
    return { message, evidence };
  };

  return [
    route.get(
      '/api/v1/stores/{storeId}/catalog/items/{itemId}/correction-capabilities',
      ({ request, params }) => {
        db.requireMember(request, params.storeId);
        const { item, fields } = correctionCapabilities(db, params.storeId, params.itemId);
        const open = db.state.corrections?.find(
          (c) => c.storeId === params.storeId && c.catalogItemId === item.id && OPEN.includes(c.status),
        );
        return { catalogItemId: item.id, title: item.title, fields, openCorrectionId: open?.id ?? null };
      },
    ),

    route.post(
      '/api/v1/stores/{storeId}/catalog/items/{itemId}/corrections',
      ({ request, params, body, idempotencyKey }) => {
        db.requireMember(request, params.storeId, 'product.manage');
        if (!idempotencyKey) throw fail.validation('operationId', 'شناسه عملیات لازم است.');
        const { item, fields } = correctionCapabilities(db, params.storeId, params.itemId);
        const reason = body.reason?.trim();
        const entries = Object.entries(body.proposedChanges ?? {});
        if (!reason || reason.length > 2000) throw fail.validation('reason', 'دلیل اصلاح را وارد کنید.');
        if (entries.length < 1 || entries.length > 30)
          throw fail.validation('proposedChanges', 'بین ۱ تا ۳۰ تغییر پیشنهاد دهید.');
        const evidence = body.evidenceFileIds ?? [];
        if (
          evidence.length > 10 ||
          new Set(evidence).size !== evidence.length ||
          evidence.some((id) => !db.state.files.some((f) => f.id === id && f.storeId === params.storeId))
        )
          throw fail.validation('evidenceFileIds', 'مدرک باید متعلق به فروشگاه باشد.', 'FILE_NOT_FOUND');
        if (
          db.state.corrections?.some(
            (c) => c.storeId === params.storeId && c.catalogItemId === item.id && OPEN.includes(c.status),
          )
        )
          throw fail.conflict(
            'CORRECTION_ALREADY_OPEN',
            'برای این کالا یک پیشنهاد اصلاح باز دارید؛ همان را پیگیری کنید.',
          );
        const proposedChanges = normalizeProposal(fields, Object.fromEntries(entries));
        return db.mutate((s) => {
          const createdAt = new Date().toISOString();
          const result: Dto<'CorrectionRequestDto'> = {
            id: randomId(),
            catalogItemId: item.id,
            productTypeId: null,
            subject: item.title,
            status: 'Submitted',
            proposedChanges,
            reason,
            evidenceFileIds: evidence,
            decisionReason: null,
            createdAt,
            history: [{ at: createdAt, status: 'Submitted', note: reason }],
          };
          (s.corrections ??= []).push({ ...result, storeId: params.storeId });
          return result;
        });
      },
    ),

    route.get('/api/v1/stores/{storeId}/catalog/corrections', ({ request, params, query }) => {
      db.requireMember(request, params.storeId);
      const itemId = query.get('catalogItemId');
      return (db.state.corrections ?? [])
        .filter((c) => c.storeId === params.storeId && (!itemId || c.catalogItemId === itemId))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(strip);
    }),

    route.get('/api/v1/stores/{storeId}/catalog/corrections/{correctionId}', ({ request, params }) => {
      db.requireMember(request, params.storeId);
      return strip(find(params.storeId, params.correctionId));
    }),

    route.post(
      '/api/v1/stores/{storeId}/catalog/corrections/{correctionId}/reply',
      ({ request, params, body }) => {
        db.requireMember(request, params.storeId);
        find(params.storeId, params.correctionId);
        const r = reply(params.storeId, body);
        return move(params.storeId, params.correctionId, 'Reviewing', ['NeedInfo'], r.message, r.evidence);
      },
    ),

    route.post(
      '/api/v1/stores/{storeId}/catalog/corrections/{correctionId}/appeal',
      ({ request, params, body }) => {
        db.requireMember(request, params.storeId);
        find(params.storeId, params.correctionId);
        const r = reply(params.storeId, body);
        return move(params.storeId, params.correctionId, 'Appealed', ['Rejected'], r.message, r.evidence);
      },
    ),

    route.post(
      '/api/v1/stores/{storeId}/catalog/corrections/{correctionId}/withdraw',
      ({ request, params }) => {
        db.requireMember(request, params.storeId);
        find(params.storeId, params.correctionId);
        return move(
          params.storeId,
          params.correctionId,
          'Withdrawn',
          ['Submitted', 'NeedInfo', 'Rejected'],
          null,
        );
      },
    ),
  ];
};
