'use client';
import { useState } from 'react';
import { useActiveStore } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Button, Overlay } from '@dukani/ui-kit';
import { undoBulkScan, type BulkDraft, type BulkRow } from '../../../domain/bulk-draft';
import type { BarcodeCamera } from '@dukani/platform';
import type { useBulkScan } from '../hooks/use-bulk-scan';
import { useEntryNav } from '../../common/hooks/use-entry-nav';
import { useEntryTranslations } from '../../i18n/use-entry-translations';
import { BulkDraftFooter } from './BulkDraftFooter';
import { BulkReceiptSettings } from './BulkReceiptSettings';
import { BulkRows } from './BulkRows';
import { BulkScanPanel } from './BulkScanPanel';

/** Editing the bulk list: table or continuous scan, shared receipt settings, rows and the draft footer. */
export function BulkEditStage({
  draft,
  locked,
  canManage,
  mode,
  camera,
  scan,
  save,
  onChangeRow,
  onDeleteRow,
  onDiscard,
}: {
  draft: BulkDraft;
  locked: boolean;
  canManage: boolean;
  mode: 'PlusOne' | 'ScanThenQuantity';
  camera: BarcodeCamera;
  scan: ReturnType<typeof useBulkScan>;
  save: (transform: (draft: BulkDraft) => BulkDraft) => Promise<BulkDraft | undefined>;
  onChangeRow: (clientRowId: string, transform: (row: BulkRow) => BulkRow) => void;
  onDeleteRow: (clientRowId: string) => void;
  onDiscard: () => void;
}) {
  const t = useEntryTranslations();
  const go = useEntryNav();
  const store = useActiveStore();
  const [scanning, setScanning] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const showTable = () => {
    camera.stop();
    setScanning(false);
  };
  const leaveTo = (route: string) => {
    camera.stop();
    go.nav.push(route);
  };
  return (
    <>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={showTable}>
          {t('bulk.table')}
        </Button>
        <Button variant="secondary" disabled={locked || !canManage} onClick={() => setScanning(true)}>
          {t('bulk.continuous')}
        </Button>
        <Button variant="secondary" onClick={() => go.nav.push(sellerRoutes.inventory.import(store.id))}>
          {t('bulk.excel')}
        </Button>
      </div>
      {scanning ? (
        <BulkScanPanel
          camera={camera}
          feedback={scan.feedback}
          canUndo={!!draft.lastScan && !locked}
          onUndo={() => {
            void save(undoBulkScan);
            scan.setFeedback(t('bulk.undone'));
          }}
          onManual={() => leaveTo(sellerRoutes.entry.barcode(store.id) + '?bulk=1')}
          onTable={showTable}
          onSettings={() => leaveTo(sellerRoutes.settings.scan(store.id))}
        />
      ) : null}
      <Overlay
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        title={t('bulk.receiptSettings')}
        actions={<Button onClick={() => setReceiptOpen(false)}>{t('back')}</Button>}
      >
        <BulkReceiptSettings
          receipt={draft.sharedReceipt}
          mode={mode}
          disabled={locked}
          onModeChange={(scanMode) => {
            camera.stop();
            void save((d) => ({ ...d, scanMode }));
          }}
          onReceiptChange={(patch) =>
            void save((d) => ({ ...d, sharedReceipt: { ...d.sharedReceipt, ...patch } }))
          }
        />
      </Overlay>
      <Button size="sm" variant="secondary" onClick={() => setReceiptOpen(true)}>
        {t('bulk.receiptSettings')}
      </Button>
      <div className="desktop:rounded-lg desktop:bg-surface desktop:p-6 flex flex-col gap-3">
        <BulkRows rows={draft.rows} disabled={locked} onChange={onChangeRow} onDelete={onDeleteRow} />
        <Button
          variant="secondary"
          disabled={locked || !canManage || draft.rows.length >= 200}
          onClick={() => go.nav.push(sellerRoutes.entry.search(store.id, '', true))}
        >
          {t('bulk.addRow')}
        </Button>
      </div>
      {draft.rows.length && !locked ? (
        <BulkDraftFooter updatedAt={draft.updatedAt} rowCount={draft.rows.length} onDiscard={onDiscard} />
      ) : null}
    </>
  );
}
