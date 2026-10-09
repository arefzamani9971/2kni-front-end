'use client';
import { useAppMutation } from '@dukani/data';
import { useActiveStore, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { useToast } from '@dukani/ui-kit';
import { useEffect, useRef, useState } from 'react';
import { fromLineDto, toLineInput, toUpdateBody } from '../../domain/purchase';
import type { LineDraft } from '../../domain/purchase.types';
import { usePurchasingModule } from '../../module';
import { usePurchaseTranslations } from '../i18n/use-purchase-translations';
import { purchaseKeys } from './purchase-keys';
import { usePurchase } from './use-purchase';
import { useSaveDraft } from './use-save-draft';
import type { EditingPurchaseLine } from './use-purchase-lines.types';
/** Coordinates line edits and draft discard; failures remain visible in the same screen. */
export function usePurchaseLines(purchaseId: string) {
  const t = usePurchaseTranslations();
  const store = useActiveStore();
  const nav = useNavigation();
  const toast = useToast();
  const { purchases } = usePurchasingModule();
  const purchase = usePurchase(purchaseId);
  const saveDraft = useSaveDraft(purchaseId);
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState<EditingPurchaseLine | null>(null);
  const [discarding, setDiscarding] = useState(false);
  const pending = useRef(false);
  const p = purchase.data;
  const discard = useAppMutation({
    mutationFn: () => purchases.discard(store.id, purchaseId),
    invalidates: [purchaseKeys(store.id).all],
    onSuccess: () => nav.replace(sellerRoutes.purchases.list(store.id)),
  });
  useEffect(() => {
    if (p && p.status !== 'Draft') nav.replace(sellerRoutes.purchases.detail(store.id, p.id));
  }, [p, nav, store.id]);
  const replaceLines = async (lines: LineDraft[]) => {
    if (!p || pending.current || discard.isPending) return false;
    pending.current = true;
    try {
      await saveDraft.mutateAsync(toUpdateBody(p, { lines: lines.map(toLineInput) }));
      return true;
    } catch {
      return false;
    } finally {
      pending.current = false;
    }
  };
  const removeLine = async (index: number) => {
    if (p) await replaceLines(p.lines.filter((_, i) => i !== index).map((line) => fromLineDto(line)));
  };
  const saveLine = async (line: LineDraft) => {
    if (!p) return;
    const lines = p.lines.map((value) => fromLineDto(value));
    if (editing?.index != null) lines[editing.index] = line;
    else lines.push(line);
    if (await replaceLines(lines)) {
      setEditing(null);
      toast(t('lineSaved'), 'success');
    }
  };
  const discardDraft = async () => {
    if (pending.current) return;
    pending.current = true;
    try {
      await discard.mutateAsync();
    } catch {
      /* The normalized mutation error is rendered by the screen. */
    } finally {
      pending.current = false;
    }
  };
  return {
    purchase,
    picking,
    setPicking,
    editing,
    setEditing,
    discarding,
    setDiscarding,
    busy: saveDraft.isPending || discard.isPending,
    discardingBusy: discard.isPending,
    saveError: saveDraft.error ?? discard.error,
    removeLine,
    saveLine,
    discardDraft,
    back: () => nav.push(sellerRoutes.purchases.list(store.id)),
    totals: () => nav.push(sellerRoutes.purchases.totals(store.id, purchaseId)),
  };
}
