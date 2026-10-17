'use client';
import { useEffect, useRef, useState } from 'react';
import type { BarcodeAliasPreview } from '../../domain/barcode-alias.types';
import { appError, isAppError, parseBarcode, type AppError } from '@dukani/domain';
import { useActiveStore, useHardwareScanner, useNavigation } from '@dukani/platform';
import { sellerRoutes } from '@dukani/routes';
import {
  Alert,
  Button,
  ConfirmDialog,
  PageShell,
  PageState,
  ScreenHeader,
  useAppErrorMessage,
  useConfirmAction,
} from '@dukani/ui-kit';
import { BarcodeAliasFields } from '../components/BarcodeAliasFields';
import { BarcodeAliasSummary } from '../components/BarcodeAliasSummary';
import { useProduct } from '../hooks/use-product';
import { useBarcodeAliasForm } from '../hooks/use-barcode-alias-form';
import { useBarcodeAlias } from '../hooks/use-barcode-alias';
import { useProductTranslations } from '../i18n/use-product-translations';

/**
 * Second store barcode (US-F08-01, Figma 1255:55 / 1255:135, conflict 1255:56 / 1255:136): preview, explicit
 * confirmation and recovery of an unknown result. A hardware scanner fills the new code without a focused field
 * (PAT-SCAN-01 `select-one`); an invalid code is caught before any request (F08 §7).
 */
export function BarcodeAliasEditor({ productId }: { productId: string }) {
  const t = useProductTranslations();
  const message = useAppErrorMessage();
  const store = useActiveStore();
  const nav = useNavigation();
  const product = useProduct(productId);
  const flow = useBarcodeAlias(productId);
  const draft = useBarcodeAliasForm(productId);
  const { unitId, barcode } = draft.value;
  const setUnitId = (value: string) => draft.update({ unitId: value });
  const setBarcode = (value: string) => draft.update({ barcode: value });
  const [preview, setPreview] = useState<BarcodeAliasPreview>();
  const [error, setError] = useState<AppError>();
  const [preparing, setPreparing] = useState(false);
  const lock = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const p = product.data;
  const selectedUnit =
    flow.state.kind === 'succeeded'
      ? flow.state.result.storeProductUnitId
      : flow.unknown
        ? (flow.pendingIntent?.payload.storeProductUnitId ?? unitId)
        : unitId;
  const unit = p?.units.find((u) => u.id === selectedUnit) ?? (selectedUnit ? undefined : p?.units[0]);
  const busy = flow.busy || preparing;
  const saved = flow.state.kind === 'succeeded';
  const back = () => nav.replace(sellerRoutes.products.detail(store.id, productId));
  const failure = error ?? (flow.state.kind === 'failed' ? flow.state.error : undefined);
  useEffect(() => {
    if (!busy && failure) input.current?.focus();
  }, [busy, failure]);
  const conflict = failure?.code === 'BARCODE_DUPLICATE';
  const title = conflict ? t('alias.conflictTitle') : t('alias.title');
  const review = async () => {
    if (!p || !unit || lock.current || busy || flow.unknown || !flow.allowed) return;
    const code = parseBarcode(barcode);
    if (!code.ok) {
      setError(appError('Validation', 'BARCODE_INVALID', t('alias.invalid')));
      input.current?.focus();
      return;
    }
    lock.current = true;
    setPreparing(true);
    setError(undefined);
    try {
      setPreview(
        await flow.preview({ storeProductUnitId: unit.id, barcode: code.value, expectedVersion: p.version }),
      );
    } catch (e) {
      setError(isAppError(e) ? e : { kind: 'Bug', code: 'UNEXPECTED', message: '' });
      input.current?.focus();
    } finally {
      lock.current = false;
      setPreparing(false);
    }
  };
  const reset = () => {
    setPreview(undefined);
    setError(undefined);
    flow.reset();
  };
  const unavailable = p && (p.status !== 'Active' || p.kind !== 'Goods' || p.catalogStatus === 'Archived');
  const editable = flow.allowed && !!p && !unavailable && !saved && !flow.unknown && !preview && !busy;
  useHardwareScanner(
    (code) => {
      setBarcode(code);
      reset();
    },
    { enabled: editable },
  );
  // leaving discards the local draft: one run per confirmation, the dialog keeps a failure (PAT-DELETE-01)
  const leave = useConfirmAction(async () => {
    await draft.discard();
    back();
  });
  return (
    <PageShell
      title={title}
      mobileNav={false}
      header={
        <ScreenHeader
          title={title}
          subtitle={store.name}
          className="bg-canvas [&_h1]:text-heading-m desktop:[&_h1]:text-heading-xl"
        />
      }
      actions={
        <>
          {flow.allowed &&
          !saved &&
          !flow.loading &&
          !flow.recoveryError &&
          (flow.unknown || (!draft.loading && !draft.error && !unavailable && !product.error)) ? (
            <Button
              disabled={busy || (!flow.unknown && (!unit || !barcode.trim()))}
              loading={busy}
              onClick={() =>
                flow.unknown
                  ? void flow.recover()
                  : preview
                    ? void flow.submit({
                        storeProductUnitId: preview.storeProductUnitId,
                        barcode: preview.barcode,
                        expectedVersion: preview.expectedVersion,
                        previewToken: preview.previewToken,
                      })
                    : void review()
              }
            >
              {flow.unknown
                ? t('alias.recover')
                : preview
                  ? t('alias.confirm')
                  : conflict
                    ? t('alias.correct')
                    : t('alias.review')}
            </Button>
          ) : null}
          {preview && !saved && !flow.unknown ? (
            <Button variant="secondary" disabled={busy} onClick={reset}>
              {t('alias.edit')}
            </Button>
          ) : null}
          <Button
            variant="secondary"
            disabled={busy || flow.unknown}
            onClick={() => (barcode && !saved ? leave.open() : back())}
          >
            {saved ? t('back') : t('alias.cancel')}
          </Button>
        </>
      }
    >
      {!flow.allowed ? (
        <PageState kind="permission" />
      ) : product.error || flow.recoveryError || draft.error ? (
        <PageState
          kind="error"
          description={message((product.error ?? flow.recoveryError ?? draft.error)!)}
          action={
            <Button
              onClick={() => {
                void product.refetch();
                void flow.reload();
                void draft.retry();
              }}
            >
              {t('alias.retry')}
            </Button>
          }
        />
      ) : !p || flow.loading || draft.loading ? (
        <PageState kind="loading" />
      ) : unavailable ? (
        <PageState kind="empty" description={t('alias.unavailable')} />
      ) : (
        <>
          {draft.saveError ? <Alert tone="warning" title={t('alias.draftFailed')} /> : null}
          <Alert
            className={
              conflict ? undefined : 'bg-info-subtle border-transparent p-4 [&_p]:font-normal [&>svg]:hidden'
            }
            tone={conflict ? 'danger' : 'info'}
            title={t(conflict ? 'alias.conflictHint' : 'alias.hint')}
          />
          {!conflict ? (
            <BarcodeAliasSummary
              title={p.title}
              unitName={unit?.name ?? '—'}
              baseQty={unit?.baseQty ?? '—'}
            />
          ) : null}
          {saved ? (
            <Alert tone="success" title={t('alias.saved')} />
          ) : flow.unknown ? (
            <Alert tone="warning" title={t('alias.unknown')} />
          ) : (
            <BarcodeAliasFields
              units={p.units}
              unit={unit}
              barcode={barcode}
              preview={preview}
              failure={failure}
              busy={busy}
              inputRef={input}
              onUnitChange={(value) => {
                setUnitId(value);
                reset();
              }}
              onBarcodeChange={(value) => {
                setBarcode(value);
                reset();
              }}
              onRefresh={() => {
                reset();
                void product.refetch();
              }}
            />
          )}
        </>
      )}
      <ConfirmDialog
        {...leave.dialog}
        title={t('local.leaveTitle')}
        description={t('local.leaveHint')}
        confirmLabel={t('local.leave')}
        cancelLabel={t('local.stay')}
        destructive
      >
        {leave.error ? <Alert tone="danger" title={message(leave.error)} /> : null}
      </ConfirmDialog>
    </PageShell>
  );
}
