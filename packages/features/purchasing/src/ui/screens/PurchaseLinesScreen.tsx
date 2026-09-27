'use client';
import type { Dto } from '@dukani/contracts';
import { formatJalali, toPersianDigits } from '@dukani/domain';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, BottomSheet, Button, ConfirmDialog, IconButton, ListRow, PageState, ProductDataRow, Section, useToast } from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { fromLineDto, lineRow, toLineInput, toman, toUpdateBody, type LineDraft } from '../../domain/purchase';
import { usePurchasingModule } from '../../module';
import { LineEditor } from '../components/LineEditor';
import { ProductPicker } from '../components/ProductPicker';
import { PurchasingShell } from '../components/PurchasingShell';
import { purchaseKeys, usePurchase, useSaveDraft, useStoreProduct } from '../hooks/use-purchasing';
import { useInvalidate } from '@dukani/data';

/** Receipt lines of a draft: add, change and remove products before the totals step. */
export function PurchaseLinesScreen({ purchaseId }: { purchaseId: string }) {
  const store = useActiveStore();
  const nav = useNavigation();
  const toast = useToast();
  const { purchases } = usePurchasingModule();
  const invalidate = useInvalidate();
  const purchase = usePurchase(purchaseId);
  const saveDraft = useSaveDraft(purchaseId);
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<{ productId: string; index: number | null } | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const p = purchase.data;

  useEffect(() => {
    if (p && p.status !== 'Draft') nav.replace(sellerRoutes.purchases.detail(store.id, p.id));
  }, [p, nav, store.id]);

  const replaceLines = async (dto: Dto<'PurchaseDto'>, lines: LineDraft[]) => {
    await saveDraft.mutateAsync(toUpdateBody(dto, { lines: lines.map(toLineInput) }));
  };

  const title = p
    ? [p.supplier?.name, p.supplierInvoiceNo ? `فاکتور ${toPersianDigits(p.supplierInvoiceNo)}` : null, formatJalali(new Date(p.purchasedAt), 'd MMMM yyyy')]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <PurchasingShell
      title="اقلام رسید خرید"
      back={() => nav.push(sellerRoutes.purchases.list(store.id))}
      actions={
        p ? (
          <>
            <Button block disabled={p.lines.length === 0} onClick={() => nav.push(sellerRoutes.purchases.totals(store.id, p.id))}>
              بررسی جمع رسید
            </Button>
            <Button variant="secondary" block onClick={() => nav.push(sellerRoutes.purchases.list(store.id))}>
              ذخیرهٔ پیش‌نویس و خروج
            </Button>
          </>
        ) : undefined
      }
    >
      {purchase.isPending ? <PageState kind="loading" rows={3} /> : null}
      {purchase.error ? <PageState kind={purchase.error.kind === 'NotFound' ? 'not-found' : 'error'} description={purchase.error.message} /> : null}
      {saveDraft.error ? <Alert title="ذخیره نشد" description={saveDraft.error.message} /> : null}
      {p ? (
        <>
          <Section title="رسید پیش‌نویس">
            <ListRow>{title || 'بدون تأمین‌کننده'}</ListRow>
            <ListRow>جمع فعلی: {toman(p.totalRials)}</ListRow>
          </Section>
          <Section title={`اقلام (${toPersianDigits(String(p.lines.length))})`}>
            {p.lines.map((l, i) => (
              <ProductDataRow
                key={l.id}
                title={l.title}
                meta={lineRow(l)}
                metaTone={l.costStatus === 'Unknown' ? 'warning' : 'neutral'}
                trailing={
                  <span className="flex items-center">
                    <IconButton icon="edit" label={`ویرایش ${l.title}`} onClick={() => setEditing({ productId: l.storeProductId, index: i })} />
                    <IconButton
                      icon="trash"
                      label={`حذف ${l.title}`}
                      tone="danger"
                      onClick={() => void replaceLines(p, p.lines.filter((_, j) => j !== i).map((x) => fromLineDto(x)))}
                    />
                  </span>
                }
              />
            ))}
            <Button variant="secondary" block iconStart="plus" onClick={() => setPicking(true)}>
              افزودن کالای دیگر
            </Button>
          </Section>
          <Button variant="text" block className="text-danger" onClick={() => setDiscarding(true)}>
            دورریختن این پیش‌نویس
          </Button>
          <ProductPicker open={picking} onOpenChange={setPicking} onPick={(id) => setEditing({ productId: id, index: null })} />
          <LineSheet
            editing={editing}
            purchase={p}
            onClose={() => setEditing(null)}
            onSave={async (line) => {
              const lines = p.lines.map((x) => fromLineDto(x));
              if (editing?.index != null) lines[editing.index] = line;
              else lines.push(line);
              await replaceLines(p, lines);
              setEditing(null);
              toast('قلم رسید ذخیره شد.', 'success');
            }}
            busy={saveDraft.isPending}
          />
          <ConfirmDialog
            open={discarding}
            onOpenChange={setDiscarding}
            title="پیش‌نویس دور ریخته شود؟"
            description="اقلام این رسید حذف می‌شوند و موجودی تغییری نمی‌کند."
            confirmLabel="دورریختن"
            destructive
            onConfirm={async () => {
              await purchases.discard(store.id, p.id);
              await invalidate(purchaseKeys(store.id).all);
              nav.replace(sellerRoutes.purchases.list(store.id));
            }}
          />
        </>
      ) : null}
    </PurchasingShell>
  );
}

function LineSheet({
  editing,
  purchase,
  onClose,
  onSave,
  busy,
}: {
  editing: { productId: string; index: number | null } | null;
  purchase: Dto<'PurchaseDto'>;
  onClose: () => void;
  onSave: (line: LineDraft) => Promise<void>;
  busy: boolean;
}) {
  const product = useStoreProduct(editing?.productId ?? null);
  const initial = editing?.index != null ? fromLineDto(purchase.lines[editing.index]!, product.data?.baseUnitName) : undefined;
  return (
    <BottomSheet open={!!editing} onOpenChange={(o) => !o && onClose()} title={product.data?.title ?? 'قلم رسید'} full>
      {product.data ? (
        <LineEditor key={`${editing?.productId}-${editing?.index}`} product={product.data} initial={initial} submitLabel="ذخیرهٔ قلم" onSubmit={onSave} busy={busy} />
      ) : (
        <PageState kind="loading" rows={2} />
      )}
    </BottomSheet>
  );
}
