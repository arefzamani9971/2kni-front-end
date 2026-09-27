'use client';
import { useAppQuery, useFinalCommand } from '@dukani/data';
import { formatMoney, fromApiMoney, newOperationId, type OperationId } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { Alert, Button, ListRow, PageState, Section } from '@dukani/ui-kit';
import { useEffect } from 'react';
import { baseUnitNameOf, titleOf, type EntryDraft, type EntryResult } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';
import { BackButton, EntryShell, MissingDraft } from '../components/EntryShell';
import { entryKeys, useEntryDraft, useEntryNav } from '../hooks/use-entry';

const COST_LABEL = { Known: 'معلوم', Estimated: 'تخمینی', Unknown: 'نامعلوم' } as const;

/** review (Figma 312:9441, reviewknown 312:10817, reviewestimated 312:10883): server preview → «تأیید و ثبت» (F13). */
export function EntryReviewScreen({ draftId }: { draftId: string }) {
  const { draft, loading, missing, save } = useEntryDraft(draftId);
  const go = useEntryNav();
  useEffect(() => {
    // one operation id per «تأیید و ثبت», persisted before sending so a refresh reuses it (P11)
    if (draft && !draft.operationId && !draft.result) void save((d) => ({ ...d, operationId: newOperationId() }));
  }, [draft, save]);
  if (missing) return <MissingDraft onRestart={go.method} />;
  if (loading || !draft?.operationId)
    return (
      <EntryShell title="بازبینی کالا و موجودی">
        <PageState kind="loading" rows={3} />
      </EntryShell>
    );
  return <Review draft={draft} save={save} />;
}

function Review({ draft, save }: { draft: EntryDraft; save: (u: (d: EntryDraft) => EntryDraft) => Promise<EntryDraft | null> }) {
  const { commands } = useProductEntryModule();
  const store = useActiveStore();
  const go = useEntryNav();
  const preview = useAppQuery({
    queryKey: entryKeys(store.id).custom('preview', draft.id, draft.stock, draft.pricing, draft.newItem, draft.localTitle),
    queryFn: () => commands.preview(store.id, draft),
  });
  const register = useFinalCommand<EntryDraft, EntryResult>({
    operationId: draft.operationId as OperationId,
    run: async (d, operationId) => {
      const r = await commands.register(store.id, d, operationId);
      return { ...r, title: titleOf(d), baseUnitName: baseUnitNameOf(d), catalogStatus: r.catalogItemCreated ? 'Private' : 'Public' };
    },
    invalidates: [['products', store.id], ['reports', store.id], entryKeys(store.id).custom('search')],
    onSuccess: async (result) => {
      await save((d) => ({ ...d, result }));
      go.step(draft.id, 'done', true);
    },
  });

  const p = preview.data;
  const failed = register.state.kind === 'failed' ? register.state.error : null;
  const sale = p?.salePriceRials != null ? formatMoney(fromApiMoney(p.salePriceRials)!) : null;
  const item = draft.newItem;

  return (
    <EntryShell
      title="بازبینی کالا و موجودی"
      actions={
        <>
          <Button block loading={register.busy} disabled={!p} onClick={() => void register.submit(draft)}>
            تأیید و ثبت
          </Button>
          <BackButton onClick={go.back} />
        </>
      }
    >
      {register.state.kind === 'unknown' ? (
        <PageState
          kind="unknown-result"
          action={
            <Button variant="secondary" onClick={() => void register.retry()}>
              بررسی دوباره
            </Button>
          }
        />
      ) : null}
      {failed ? <Alert title="ثبت انجام نشد" description={failed.message} /> : null}
      {preview.error ? <Alert title="اطلاعات کامل نیست" description={preview.error.message} /> : null}
      {preview.isPending ? <PageState kind="loading" rows={3} /> : null}
      {p ? (
        <>
          <Section title="کالای فروشگاه">
            <ListRow>{p.title}</ListRow>
            <ListRow>
              {[
                item ? `نوع ${item.productTypeName}` : draft.catalog ? `نوع ${draft.catalog.typeName}` : null,
                item?.brandName ? `برند ${item.brandName}` : draft.catalog?.brandName ? `برند ${draft.catalog.brandName}` : null,
                `واحد ${p.baseUnitName}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </ListRow>
          </Section>
          <Section title="موجودی و قیمت">
            <ListRow>{p.conversionText ?? 'بدون موجودی؛ بعداً از «ثبت خرید» اضافه کنید.'}</ListRow>
            {draft.stock ? (
              <ListRow>
                بهای اولیه: {COST_LABEL[p.costStatus]}
                {p.costPerBaseRials != null ? ` · هر ${p.baseUnitName} ${formatMoney(fromApiMoney(p.costPerBaseRials)!)}` : ''}
              </ListRow>
            ) : null}
            <ListRow>{sale ? `فروش هر ${p.baseUnitName}: ${sale}` : 'قیمت فروش: هنوز تعیین نشده'}</ListRow>
          </Section>
          <Alert
            tone="warning"
            title="پیش از ثبت"
            description={
              <ul className="flex list-disc flex-col gap-1 ps-4">
                {p.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
                {draft.source === 'new' ? <li>کالا فوراً برای فروشگاه قابل استفاده است؛ انتشار عمومی پس از بررسی.</li> : null}
              </ul>
            }
          />
        </>
      ) : null}
    </EntryShell>
  );
}
