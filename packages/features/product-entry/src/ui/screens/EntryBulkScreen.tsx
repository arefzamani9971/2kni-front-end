'use client';
import { useRef, useState } from 'react';
import { useAppQuery, useFinalCommand } from '@dukani/data';
import { decimal, isAppError, newOperationId, newUuid, parseDecimalInput } from '@dukani/domain';
import { useActiveStore, useCan, useOnlineStatus } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ConfirmDialog,
  DecimalField,
  PageState,
  ReviewScene,
  Overlay,
  ScanWorkspace,
  Section,
  useAppErrorMessage,
} from '@dukani/ui-kit';
import type { BulkDraft, BulkRow } from '../../domain/bulk-draft';
import { acceptBulkScan, appendBulkRow, toBulkRequest, undoBulkScan } from '../../domain/bulk-draft';
import { entryUnitsOf, titleOf } from '../../domain/entry-draft';
import { useProductEntryModule } from '../../module';
import { BulkPreviewSummary } from '../components/BulkPreviewSummary';
import { BulkRows } from '../components/BulkRows';
import { EntryShell } from '../components/EntryShell';
import { useBulkDraft, emptyBulkDraft } from '../hooks/use-bulk-draft';
import { useBarcodeCamera } from '../hooks/use-barcode-camera';
import { BulkReceiptSettings } from '../components/BulkReceiptSettings';
import { useEntryPresentation } from '../i18n/use-entry-presentation';
import { useEntryNav } from '../hooks/use-entry-nav';
import { useStartEntry } from '../hooks/use-start-entry';
import { useEntryTranslations } from '../i18n/use-entry-translations';

export function EntryBulkScreen({ stage = 'edit' }: { stage?: 'edit' | 'review' | 'done' }) {
  const q = useBulkDraft();
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  if (q.error)
    return (
      <EntryShell title={t('bulk.title')}>
        <PageState
          kind="error"
          description={message(q.error)}
          action={<Button onClick={() => void q.refetch()}>{t('retry')}</Button>}
        />
      </EntryShell>
    );
  if (q.isPending)
    return (
      <EntryShell title={t('bulk.title')}>
        <PageState kind="loading" />
      </EntryShell>
    );
  return <BulkEditor draft={q.data ?? emptyBulkDraft()} update={q.update} stage={stage} />;
}
function BulkEditor({
  draft,
  update,
  stage,
}: {
  draft: BulkDraft;
  update: (transform: (draft: BulkDraft) => BulkDraft) => Promise<BulkDraft>;
  stage: 'edit' | 'review' | 'done';
}) {
  const t = useEntryTranslations();
  const message = useAppErrorMessage();
  const go = useEntryNav();
  const store = useActiveStore();
  const can = useCan('product.manage');
  const online = useOnlineStatus();
  const { catalog, commands } = useProductEntryModule();
  const { prepareCatalog } = useStartEntry();
  const presentation = useEntryPresentation();
  const settings = useAppQuery({
    queryKey: ['entry-scan-settings', store.id],
    queryFn: ({ signal }) => catalog.settings(store.id, signal),
  });
  const [quantityRow, setQuantityRow] = useState<BulkRow | null>(null);
  const [scanQuantity, setScanQuantity] = useState('');
  const mode = draft.scanMode ?? settings.data?.scanMode ?? 'PlusOne';
  const [scanning, setScanning] = useState(false);
  const [failed, setFailed] = useState<unknown>();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const lookupBusy = useRef(false);
  const url = (suffix = '') => '/s/' + store.id + '/entry/bulk' + suffix;
  const locked = !!draft.pending || !!draft.result;
  const save = async (transform: (d: BulkDraft) => BulkDraft) => {
    try {
      return await update(transform);
    } catch (error) {
      setFailed(error);
    }
  };
  const scan = async (code: string, signal: AbortSignal) => {
    if (lookupBusy.current || quantityRow || locked || !can) return;
    lookupBusy.current = true;
    setFailed(undefined);
    try {
      const result = await catalog.lookupBarcode(store.id, code, signal);
      if (signal.aborted) return;
      const match = result.matches[0];
      if (
        result.kind !== 'StoreProduct' ||
        result.matches.length !== 1 ||
        !match ||
        match.unitActive === false ||
        match.catalogStatus === 'Archived' ||
        match.storeProductStatus === 'Archived'
      ) {
        go.nav.push(sellerRoutes.entry.search(store.id, code, true) + '&origin=camera');
        return;
      }
      const entry = await prepareCatalog(match.catalogItemId, match.storeProductId ?? null, { match });
      const unit = entryUnitsOf(entry).find(
        (u) =>
          u.storeProductUnitId === match.storeProductUnitId ||
          u.catalogItemUnitId === match.catalogItemUnitId,
      );
      if (!unit || match.itemKind === 'Service') throw new Error('ENTRY_UNIT_UNAVAILABLE');
      const row: BulkRow = {
        clientRowId: newUuid(),
        entry: {
          ...entry,
          stockDecided: true,
          stock: {
            kind: draft.sharedReceipt.kind,
            unitKey: unit.key,
            quantity: decimal.of(1),
            costStatus: 'Unknown',
            unitCost: null,
            supplierId: null,
            supplierName: null,
            supplierInvoiceNo: '',
            productionDate: null,
            expiryDate: null,
          },
        },
      };
      if (signal.aborted) return;
      if (mode === 'ScanThenQuantity') {
        setQuantityRow(row);
        setScanQuantity('');
        return;
      }
      const accepted = await update((d) => acceptBulkScan(d, row));
      setFeedback(
        t('bulk.accepted', { title: match.title }) + ' · ' + presentation.qty(accepted.rows.length),
      );
    } catch (error) {
      setFailed(error);
    } finally {
      lookupBusy.current = false;
    }
  };
  const camera = useBarcodeCamera((code, signal) => void scan(code, signal), { continuous: true });
  const preview = useAppQuery({
    queryKey: ['entry-bulk-preview', store.id, toBulkRequest(draft)],
    enabled: stage === 'review' && online && draft.rows.length > 0 && !draft.result,
    queryFn: () => commands.validateBulk(store.id, toBulkRequest(draft)),
  });
  const commit = useFinalCommand<
    { body: ReturnType<typeof toBulkRequest>; operationId: ReturnType<typeof newOperationId> },
    Awaited<ReturnType<typeof commands.registerBulk>>
  >({
    operationId: draft.pending?.operationId,
    run: (intent) => commands.registerBulk(store.id, intent.body, intent.operationId),
    invalidates: [
      ['products', store.id],
      ['reports', store.id],
    ],
    onSuccess: async (result) => {
      await update((d) => ({ ...d, result }));
      go.nav.replace(url('/done'));
    },
  });
  const submit = async () => {
    if (!can || !online || commit.busy || !preview.data || preview.data.errorCount || draft.result) return;
    try {
      const saved = await update((d) =>
        d.pending ? d : { ...d, pending: { operationId: newOperationId(), body: toBulkRequest(d) } },
      );
      if (saved.pending) await commit.submit(saved.pending);
    } catch (error) {
      setFailed(error);
    }
  };
  const patchRow = (id: string, transform: (row: BulkRow) => BulkRow) => {
    if (!locked)
      void save((d) => ({
        ...d,
        lastScan: undefined,
        rows: d.rows.map((r) => (r.clientRowId === id ? transform(r) : r)),
      }));
  };
  const refreshRow = async (id: string) => {
    const row = draft.rows.find((row) => row.clientRowId === id);
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
      setFailed(error);
    }
  };
  const edit = () => go.nav.push(url());
  const correctFailure = async () => {
    if (commit.state.kind !== 'failed') return;
    await update((d) => ({ ...d, pending: undefined }));
    edit();
  };
  const success = draft.result ?? (commit.state.kind === 'succeeded' ? commit.state.result : undefined);
  const reviewActions = (
    <>
      <Button
        block
        loading={commit.busy}
        disabled={
          !online ||
          !can ||
          !preview.data ||
          preview.data.errorCount > 0 ||
          commit.state.kind === 'unknown' ||
          (!!draft.pending && commit.state.kind === 'idle') ||
          !!success
        }
        onClick={() => void submit()}
      >
        {t('bulk.confirm')}
      </Button>
      <Button
        block
        variant="secondary"
        disabled={locked && commit.state.kind !== 'failed'}
        onClick={() => {
          if (commit.state.kind === 'failed') void correctFailure();
          else edit();
        }}
      >
        {t('bulk.edit')}
      </Button>
    </>
  );
  return (
    <EntryShell
      title={t(stage === 'done' && success ? 'bulk.done' : stage === 'review' ? 'bulk.review' : 'bulk.title')}
      back={go.method}
      actions={
        stage === 'done' && success ? (
          <>
            <Button
              block
              onClick={() => {
                void save(() => emptyBulkDraft()).then((saved) => {
                  if (saved) edit();
                });
              }}
            >
              {t('bulk.new')}
            </Button>
            <Button
              block
              variant="secondary"
              onClick={() => go.nav.push(sellerRoutes.products.list(store.id))}
            >
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
            onClick={() => go.nav.push(url('/review'))}
          >
            {t('bulk.review')}
          </Button>
        )
      }
    >
      <ConfirmDialog
        open={discard}
        onOpenChange={setDiscard}
        title={t('bulk.discardConfirm')}
        confirmLabel={t('bulk.discard')}
        cancelLabel={t('back')}
        destructive
        onConfirm={() => {
          void save(() => emptyBulkDraft());
          setDiscard(false);
        }}
      />
      <Overlay
        open={!!quantityRow}
        onOpenChange={(open) => {
          if (!open) setQuantityRow(null);
        }}
        title={quantityRow ? titleOf(quantityRow.entry) : t('quantity')}
        actions={
          <Button
            disabled={!scanQuantity || !parseDecimalInput(scanQuantity).ok}
            onClick={() => {
              const parsed = parseDecimalInput(scanQuantity);
              if (!parsed.ok || !decimal.isPositive(parsed.value) || !quantityRow?.entry.stock) return;
              const row = {
                ...quantityRow,
                entry: {
                  ...quantityRow.entry,
                  stock: { ...quantityRow.entry.stock, quantity: parsed.value },
                },
              };
              void save((d) => ({
                ...appendBulkRow(d, row),
                lastScan: { clientRowId: row.clientRowId, before: null },
              })).then((saved) => {
                if (saved) setQuantityRow(null);
              });
            }}
          >
            {t('bulk.addRow')}
          </Button>
        }
      >
        <DecimalField
          label={t('quantity')}
          value={scanQuantity}
          onChange={setScanQuantity}
          required
          maxDecimals={quantityRow?.entry.catalog?.baseUnitMaxDecimals ?? 3}
        />
      </Overlay>
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
      {!online ? <Alert tone="warning" title={t('bulk.offline')} /> : null}
      {failed ? (
        <Alert tone="danger" title={isAppError(failed) ? message(failed) : t('startFailed')} />
      ) : null}
      {commit.state.kind === 'failed' ? <Alert tone="danger" title={message(commit.state.error)} /> : null}
      {commit.state.kind === 'unknown' ||
      (draft.pending && !success && !commit.busy && commit.state.kind !== 'failed') ? (
        <PageState
          kind="unknown-result"
          action={
            <Button
              onClick={() => {
                if (draft.pending) void commit.submit(draft.pending);
              }}
            >
              {t('checkAgain')}
            </Button>
          }
        />
      ) : null}
      {success ? (
        <ReviewScene
          open
          title={t('bulk.done')}
          onOpenChange={() => {}}
          actions={
            <>
              <Button
                onClick={() => {
                  void save(() => emptyBulkDraft()).then(edit);
                }}
              >
                {t('bulk.new')}
              </Button>
              <Button variant="secondary" onClick={() => go.nav.push(sellerRoutes.products.list(store.id))}>
                {t('bulk.inventory')}
              </Button>
            </>
          }
        >
          <Alert
            tone="success"
            title={t('bulk.success', { count: success.results.length })}
            description={success.purchaseId ? t('bulk.receiptCreated') : t('bulk.productsCreated')}
          />
        </ReviewScene>
      ) : null}
      {stage === 'done' && !success ? <Alert title={t('bulk.notCommitted')} /> : null}
      {stage === 'edit' ? (
        <>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                camera.stop();
                setScanning(false);
              }}
            >
              {t('bulk.table')}
            </Button>
            <Button variant="secondary" disabled={locked || !can} onClick={() => setScanning(true)}>
              {t('bulk.continuous')}
            </Button>
            <Button variant="secondary" onClick={() => go.nav.push('/s/' + store.id + '/inventory/import')}>
              {t('bulk.excel')}
            </Button>
          </div>
          {scanning ? (
            <>
              <ScanWorkspace
                videoRef={camera.videoRef}
                active={camera.state === 'scanning'}
                preview
                hint={t('scanAimHint')}
                status={feedback || t(`camera.${camera.state}`)}
                actions={[
                  {
                    kind: 'keyboard',
                    label: t('manualBarcode'),
                    onClick: () => {
                      camera.stop();
                      go.nav.push(sellerRoutes.entry.barcode(store.id) + '?bulk=1');
                    },
                  },
                  {
                    kind: 'layers',
                    label: t('bulk.table'),
                    onClick: () => {
                      camera.stop();
                      setScanning(false);
                    },
                  },
                  {
                    kind: 'settings',
                    label: t('scanSettings'),
                    onClick: () => {
                      camera.stop();
                      go.nav.push(sellerRoutes.settings.scan(store.id));
                    },
                  },
                ]}
              />
              <Button
                variant="secondary"
                disabled={camera.state === 'requesting' || camera.state === 'scanning'}
                onClick={() => void camera.start()}
              >
                {t('allowCamera')}
              </Button>
              <Button
                variant="secondary"
                disabled={!draft.lastScan || locked}
                onClick={() => {
                  void save(undoBulkScan);
                  setFeedback(t('bulk.undone'));
                }}
              >
                {t('bulk.undo')}
              </Button>
            </>
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
            <BulkRows rows={draft.rows} disabled={locked} onChange={patchRow} onDelete={setDeleteId} />
            <Button
              variant="secondary"
              disabled={locked || !can || draft.rows.length >= 200}
              onClick={() => go.nav.push(sellerRoutes.entry.search(store.id, '', true))}
            >
              {t('bulk.addRow')}
            </Button>
          </div>
          {draft.rows.length && !locked ? (
            <div className="text-body-s text-fg-secondary flex flex-wrap items-center justify-between gap-2">
              <p>
                {t('bulk.saved', {
                  time: presentation.digits(
                    new Date(draft.updatedAt).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  ),
                })}{' '}
                · {t('bulk.rowCount', { count: draft.rows.length })}
              </p>
              <Button variant="secondary" size="sm" onClick={() => setDiscard(true)}>
                {t('bulk.discard')}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
      {stage !== 'edit' ? (
        <div className="desktop:block hidden">
          <Section title={t('bulk.items')}>
            <BulkRows rows={draft.rows} disabled onChange={() => {}} onDelete={() => {}} />
          </Section>
        </div>
      ) : null}
      {stage === 'review' && !success ? (
        <ReviewScene
          open
          onOpenChange={(open) => {
            if (!open && !locked) edit();
          }}
          title={t('bulk.review')}
          className="desktop:max-w-[640px]"
          actions={reviewActions}
        >
          <div className="flex flex-col gap-4">
            {preview.data ? (
              <BulkPreviewSummary
                data={preview.data}
                onRefreshRow={!locked ? (id) => void refreshRow(id) : undefined}
              />
            ) : null}
            {preview.isPending ? <PageState kind="loading" /> : null}
            {preview.error ? (
              <PageState
                kind="error"
                description={message(preview.error)}
                action={<Button onClick={() => void preview.refetch()}>{t('retry')}</Button>}
              />
            ) : null}
          </div>
        </ReviewScene>
      ) : null}
    </EntryShell>
  );
}
