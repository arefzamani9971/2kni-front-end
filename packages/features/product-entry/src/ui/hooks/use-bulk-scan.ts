'use client';
import { useRef, useState } from 'react';
import { decimal, newUuid, parseDecimalInput } from '@dukani/domain';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { acceptBulkScan, appendBulkRow, type BulkDraft, type BulkRow } from '../../domain/bulk-draft';
import { directScanMatch, scannedRow } from '../../domain/bulk-scan';
import { entryUnitsOf } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';
import { useEntryPresentation } from '../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { useEntryNav } from '../common/hooks/use-entry-nav';
import { useStartEntry } from '../common/hooks/use-start-entry';

/**
 * Continuous scanning into the bulk draft: a direct match adds (+1) or asks for a quantity first, depending on the
 * mode; anything ambiguous opens the explicit selection flow. One lookup runs at a time.
 */
export function useBulkScan(options: {
  readonly draft: BulkDraft;
  readonly mode: 'PlusOne' | 'ScanThenQuantity';
  readonly enabled: boolean;
  readonly update: (transform: (draft: BulkDraft) => BulkDraft) => Promise<BulkDraft>;
  readonly save: (transform: (draft: BulkDraft) => BulkDraft) => Promise<BulkDraft | undefined>;
  readonly onError: (error: unknown) => void;
}) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const go = useEntryNav();
  const store = useActiveStore();
  const { catalog } = useProductEntryModule();
  const { prepareCatalog } = useStartEntry();
  const busy = useRef(false);
  const [pendingRow, setPendingRow] = useState<BulkRow | null>(null);
  const [feedback, setFeedback] = useState('');

  const scan = async (code: string, signal: AbortSignal) => {
    if (busy.current || pendingRow || !options.enabled) return;
    busy.current = true;
    options.onError(undefined);
    try {
      const result = await catalog.lookupBarcode(store.id, code, signal);
      if (signal.aborted) return;
      const match = directScanMatch(result);
      if (!match) return go.nav.push(sellerRoutes.entry.search(store.id, code, true) + '&origin=camera');
      const entry = await prepareCatalog(match.catalogItemId, match.storeProductId ?? null, { match });
      const unit = entryUnitsOf(entry).find(
        (u) =>
          (!!match.storeProductUnitId && u.storeProductUnitId === match.storeProductUnitId) ||
          (!!match.catalogItemUnitId && u.catalogItemUnitId === match.catalogItemUnitId),
      );
      if (!unit) throw new Error('ENTRY_UNIT_UNAVAILABLE');
      const row = scannedRow(newUuid(), entry, unit.key, options.draft.sharedReceipt);
      if (signal.aborted) return;
      if (options.mode === 'ScanThenQuantity') return setPendingRow(row);
      const accepted = await options.update((d) => acceptBulkScan(d, row));
      setFeedback(
        t('bulk.accepted', { title: match.title }) + ' · ' + presentation.qty(accepted.rows.length),
      );
    } catch (error) {
      options.onError(error);
    } finally {
      busy.current = false;
    }
  };

  /** «اسکن، سپس تعداد»: the row is added only with a positive quantity. */
  const confirmQuantity = async (raw: string) => {
    const parsed = parseDecimalInput(raw);
    if (!parsed.ok || !decimal.isPositive(parsed.value) || !pendingRow?.entry.stock) return;
    const row = {
      ...pendingRow,
      entry: { ...pendingRow.entry, stock: { ...pendingRow.entry.stock, quantity: parsed.value } },
    };
    const saved = await options.save((d) => ({
      ...appendBulkRow(d, row),
      lastScan: { clientRowId: row.clientRowId, before: null },
    }));
    if (saved) setPendingRow(null);
  };

  return {
    scan,
    pendingRow,
    cancelQuantity: () => setPendingRow(null),
    confirmQuantity,
    feedback,
    setFeedback,
  };
}
