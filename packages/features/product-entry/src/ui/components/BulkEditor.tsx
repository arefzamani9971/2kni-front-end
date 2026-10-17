'use client';
import { useState } from 'react';
import { useAppQuery } from '@dukani/data';
import { decimal } from '@dukani/domain';
import { useActiveStore, useBarcodeCamera, useCan, useOnlineStatus } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import { Alert, Button, ConfirmDialog, Section } from '@dukani/ui-kit';
import { emptyBulkDraft, type BulkDraft, type BulkRow } from '../../domain/bulk-draft';
import { useProductEntryModule } from '../../module';
import { useBulkCommit } from '../hooks/use-bulk-commit';
import { useBulkScan } from '../hooks/use-bulk-scan';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { BulkEditStage } from './BulkEditStage';
import { BulkQuantityDialog } from './BulkQuantityDialog';
import { BulkReviewActions } from './BulkReviewActions';
import { BulkReviewDialog } from './BulkReviewDialog';
import { BulkRows } from './BulkRows';
import { BulkStatusAlerts } from './BulkStatusAlerts';
import { BulkSuccessDialog } from './BulkSuccessDialog';
import { EntryShell } from './EntryShell';

/** Multi-item entry (F14 slice of F07–F10): edit → review → done, all on one versioned local draft. */
export function BulkEditor({
  draft,
  update,
  stage,
}: {
  draft: BulkDraft;
  update: (transform: (draft: BulkDraft) => BulkDraft) => Promise<BulkDraft>;
  stage: 'edit' | 'review' | 'done';
}) {
  const t = useEntryTranslations();
  const go = useEntryNav();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const online = useOnlineStatus();
  const { catalog } = useProductEntryModule();
  const { prepareCatalog } = useStartEntry();
  const settings = useAppQuery({
    queryKey: ['entry-scan-settings', store.id],
    queryFn: ({ signal }) => catalog.settings(store.id, signal),
  });
  const [failure, setFailure] = useState<unknown>();
  const [discarding, setDiscarding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const mode = draft.scanMode ?? settings.data?.scanMode ?? 'PlusOne';
  const locked = !!draft.pending || !!draft.result;
  const save = async (transform: (d: BulkDraft) => BulkDraft) => {
    try {
      return await update(transform);
    } catch (error) {
      setFailure(error);
    }
  };
  const scan = useBulkScan({ draft, mode, enabled: !locked && can, update, save, onError: setFailure });
  const camera = useBarcodeCamera((code, signal) => void scan.scan(code, signal), {
    continuous: true,
    resetKey: store.id,
  });
  const commit = useBulkCommit({ draft, reviewing: stage === 'review', update, onError: setFailure });
  const edit = () => go.nav.push(sellerRoutes.entry.bulk(store.id));
  const startOver = () => void save(() => emptyBulkDraft()).then((saved) => saved && edit());
  const openInventory = () => go.nav.push(sellerRoutes.products.list(store.id));
  const commitState = commit.command.state;
  const failed = commitState.kind === 'failed';
  const patchRow = (id: string, transform: (row: BulkRow) => BulkRow) => {
    if (!locked)
      void save((d) => ({
        ...d,
        lastScan: undefined,
        rows: d.rows.map((r) => (r.clientRowId === id ? transform(r) : r)),
      }));
  };
  // a catalog change since the row was added: reload the item for every row of it, quantities untouched
  const refreshRow = async (id: string) => {
    const row = draft.rows.find((r) => r.clientRowId === id);
    if (!row?.entry.catalog) return;
    try {
      const fresh = await prepareCatalog(row.entry.catalog.id, row.entry.catalog.storeProductId);
      await update((current) => ({
        ...current,
        rows: current.rows.map((existing) =>
          existing.entry.catalog?.id === row.entry.catalog?.id
            ? { ...existing, entry: { ...existing.entry, catalog: fresh.catalog } }
            : existing,
        ),
      }));
    } catch (error) {
      setFailure(error);
    }
  };
  const reviewActions = (
    <BulkReviewActions
      busy={commit.command.busy}
      canConfirm={
        online &&
        can &&
        !!commit.preview.data &&
        commit.preview.data.errorCount === 0 &&
        commit.command.state.kind !== 'unknown' &&
        !(draft.pending && commit.command.state.kind === 'idle') &&
        !commit.success
      }
      canEdit={!locked || failed}
      onConfirm={() => void commit.submit()}
      onEdit={() => (failed ? void commit.release().then(edit) : edit())}
    />
  );
  const done = stage === 'done' && !!commit.success;
  return (
    <EntryShell
      title={t(done ? 'bulk.done' : stage === 'review' ? 'bulk.review' : 'bulk.title')}
      back={go.method}
      actions={
        done ? (
          <>
            <Button block onClick={startOver}>
              {t('bulk.new')}
            </Button>
            <Button block variant="secondary" onClick={openInventory}>
              {t('bulk.inventory')}
            </Button>
          </>
        ) : stage === 'review' ? (
          reviewActions
        ) : (
          <Button
            block
            disabled={
              !can ||
              !draft.rows.length ||
              draft.rows.some((r) => r.entry.stock && !decimal.isPositive(r.entry.stock.quantity)) ||
              !online ||
              locked
            }
            onClick={() => go.nav.push(sellerRoutes.entry.bulk(store.id, 'review'))}
          >
            {t('bulk.review')}
          </Button>
        )
      }
    >
      <ConfirmDialog
        open={discarding}
        onOpenChange={setDiscarding}
        title={t('bulk.discardConfirm')}
        confirmLabel={t('bulk.discard')}
        cancelLabel={t('back')}
        destructive
        onConfirm={() => {
          void save(() => emptyBulkDraft());
          setDiscarding(false);
        }}
      />
      <BulkQuantityDialog
        row={scan.pendingRow}
        onCancel={scan.cancelQuantity}
        onConfirm={(quantity) => void scan.confirmQuantity(quantity)}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title={t('bulk.deleteConfirm')}
        confirmLabel={t('bulk.delete')}
        cancelLabel={t('back')}
        destructive
        onConfirm={() => {
          void save((d) => ({
            ...d,
            lastScan: undefined,
            rows: d.rows.filter((r) => r.clientRowId !== deleteId),
          }));
          setDeleteId(null);
        }}
      />
      <BulkStatusAlerts
        online={online}
        failure={failure}
        commitError={commitState.kind === 'failed' ? commitState.error : null}
        unknown={commit.unknown}
        onRecover={commit.recover}
      />
      {commit.success ? (
        <BulkSuccessDialog result={commit.success} onStartOver={startOver} onInventory={openInventory} />
      ) : null}
      {stage === 'done' && !commit.success ? <Alert title={t('bulk.notCommitted')} /> : null}
      {stage === 'edit' ? (
        <BulkEditStage
          draft={draft}
          locked={locked}
          canManage={can}
          mode={mode}
          camera={camera}
          scan={scan}
          save={save}
          onChangeRow={patchRow}
          onDeleteRow={setDeleteId}
          onDiscard={() => setDiscarding(true)}
        />
      ) : (
        <div className="desktop:block hidden">
          <Section title={t('bulk.items')}>
            <BulkRows rows={draft.rows} disabled onChange={() => {}} onDelete={() => {}} />
          </Section>
        </div>
      )}
      {stage === 'review' && !commit.success ? (
        <BulkReviewDialog
          preview={commit.preview}
          actions={reviewActions}
          onClose={!locked ? edit : undefined}
          onRefreshRow={!locked ? (id) => void refreshRow(id) : undefined}
        />
      ) : null}
    </EntryShell>
  );
}
