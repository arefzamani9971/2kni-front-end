'use client';
import { useAppErrorMessage } from '@dukani/ui-kit';
import { usePurchasePresentation } from '../i18n/use-purchase-presentation';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';

import type { Dto } from '@dukani/contracts';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ConfirmDialog,
  IconButton,
  ListRow,
  PageState,
  ProductDataRow,
  Section,
  useToast,
} from '@dukani/ui-kit';
import { useEffect, useState } from 'react';
import { fromLineDto, toLineInput, toUpdateBody } from '../../domain/purchase';
import type { LineDraft } from '../../domain/purchase.types';
import { usePurchasingModule } from '../../module';

import { ProductPicker } from '../components/ProductPicker';
import { PurchasingShell } from '../components/PurchasingShell';
import { purchaseKeys } from '../hooks/purchase-keys';
import { usePurchase } from '../hooks/use-purchase';
import { useSaveDraft } from '../hooks/use-save-draft';

import { useInvalidate } from '@dukani/data';
import { LineSheet } from '../components/LineSheet';

/** Receipt lines of a draft: add, change and remove products before the totals step. */
export function PurchaseLinesScreen({ purchaseId }: { purchaseId: string }) {
  const t = usePurchaseTranslations();
  const errorMessage = useAppErrorMessage();
  const presentation = usePurchasePresentation();

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
    ? [
        p.supplier?.name,
        p.supplierInvoiceNo ? t('invoiceNumber', { number: presentation.digits(p.supplierInvoiceNo) }) : null,
        presentation.date(p.purchasedAt),
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <PurchasingShell
      title={t('receiptItems')}
      back={() => nav.push(sellerRoutes.purchases.list(store.id))}
      actions={
        p ? (
          <>
            <Button
              block
              disabled={p.lines.length === 0}
              onClick={() => nav.push(sellerRoutes.purchases.totals(store.id, p.id))}
            >
              {t('reviewTotals')}
            </Button>
            <Button variant="secondary" block onClick={() => nav.push(sellerRoutes.purchases.list(store.id))}>
              {t('saveDraftExit')}
            </Button>
          </>
        ) : undefined
      }
    >
      {purchase.isPending ? <PageState kind="loading" rows={3} /> : null}
      {purchase.error ? (
        <PageState
          kind={purchase.error.kind === 'NotFound' ? 'not-found' : 'error'}
          description={errorMessage(purchase.error)}
        />
      ) : null}
      {saveDraft.error ? <Alert title={t('saveFailed')} description={errorMessage(saveDraft.error)} /> : null}
      {p ? (
        <>
          <Section title={t('draftReceipt')}>
            <ListRow>{title || t('noSupplier')}</ListRow>
            <ListRow>
              {t('currentTotal')}
              {presentation.toman(p.totalAmount)}
            </ListRow>
          </Section>
          <Section title={t('itemsCount', { count: p.lines.length })}>
            {p.lines.map((l, i) => (
              <ProductDataRow
                key={l.id}
                title={l.title}
                meta={presentation.lineRow(l)}
                metaTone={l.costStatus === 'Unknown' ? 'warning' : 'neutral'}
                trailing={
                  <span className="flex items-center">
                    <IconButton
                      icon="edit"
                      label={t('editNamed', { name: l.title })}
                      onClick={() => setEditing({ productId: l.storeProductId, index: i })}
                    />
                    <IconButton
                      icon="trash"
                      label={t('removeNamed', { name: l.title })}
                      tone="danger"
                      onClick={() =>
                        void replaceLines(
                          p,
                          p.lines.filter((_, j) => j !== i).map((x) => fromLineDto(x)),
                        )
                      }
                    />
                  </span>
                }
              />
            ))}
            <Button variant="secondary" block iconStart="plus" onClick={() => setPicking(true)}>
              {t('addAnotherProduct')}
            </Button>
          </Section>
          <Button variant="text" block className="text-danger" onClick={() => setDiscarding(true)}>
            {t('discardDraft')}
          </Button>
          <ProductPicker
            open={picking}
            onOpenChange={setPicking}
            onPick={(id) => setEditing({ productId: id, index: null })}
          />
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
              toast(t('lineSaved'), 'success');
            }}
            busy={saveDraft.isPending}
          />
          <ConfirmDialog
            open={discarding}
            onOpenChange={setDiscarding}
            title={t('discardTitle')}
            description={t('discardHint')}
            confirmLabel={t('discard')}
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
