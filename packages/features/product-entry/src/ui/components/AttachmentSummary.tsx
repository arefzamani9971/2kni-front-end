'use client';
import { Alert, RecordList, useAppErrorMessage } from '@dukani/ui-kit';
import { appError } from '@dukani/domain';
import { useAttachmentTranslations } from '../i18n/use-attachment-translations';
import type { AttachmentSummaryProps } from './AttachmentSummary.types';
import { useCan } from '@dukani/platform';
import { AttachmentStockAction } from './AttachmentStockAction';

/** CPB-D 1255:57/58 and CPB-M 1255:137/138: approved unit/code and per-row outcomes. */
export function AttachmentSummary({ draft }: AttachmentSummaryProps) {
  const t = useAttachmentTranslations();
  const message = useAppErrorMessage();
  const canStock = useCan('purchase.manage');
  const results = draft.chunks.flatMap((chunk) => chunk.result?.results ?? []);
  return (
    <>
      {draft.stage === 'result' ? (
        <Alert
          tone={results.some((row) => row.status === 'Failed') ? 'warning' : 'success'}
          title={t('resultCounts', {
            added: results.filter((row) => row.status === 'Added').length,
            existing: results.filter((row) => row.status === 'AlreadyExists').length,
            failed: results.filter((row) => row.status === 'Failed').length,
          })}
        />
      ) : (
        <Alert tone="info" title={t('hint')} />
      )}
      <p className="text-body-s">
        {t('chunks', { count: draft.selections.length, chunks: draft.chunks.length })}
      </p>
      <RecordList
        label={t('review')}
        columns={[t('name'), t('unit'), t('original'), t('local'), t('membership')]}
        rows={draft.chunks
          .flatMap((chunk) => chunk.preview.rows)
          .map((row) => {
            const selection = draft.selections.find((entry) => entry.row.clientRowId === row.clientRowId);
            const result = results.find((entry) => entry.clientRowId === row.clientRowId);
            const title = row.title || selection?.candidate.item.title || t('error');
            const code = result?.errorCode ?? row.errorCode;
            const status = result
              ? t(`status.${result.status}`)
              : row.storeProductId
                ? t('member')
                : t('available');
            const detail = code ? message(appError('BusinessRule', code, '')) : status;
            const outcome = (
              <div className="flex flex-col gap-2">
                <p>{detail}</p>
                {canStock && selection && result?.status === 'Added' && result.storeProductId ? (
                  <AttachmentStockAction
                    catalogItemId={selection.row.catalogItemId}
                    storeProductId={result.storeProductId}
                  />
                ) : null}
              </div>
            );
            const original = row.originalBarcodes.join(' · ') || t('noCode');
            const local = row.localBarcode || t('unchanged');
            return {
              id: row.clientRowId,
              cells: [
                title,
                row.unitName,
                <bdi key="original">{original}</bdi>,
                <bdi key="local">{local}</bdi>,
                outcome,
              ],
              card: (
                <section className="bg-surface border-line flex flex-col gap-2 rounded-md border p-4">
                  <h2 className="text-label-m">{title}</h2>
                  <p className="text-body-s text-fg-secondary">
                    {t('unit')}: {row.unitName}
                  </p>
                  <p className="text-body-s text-fg-secondary">
                    {t('original')}: <bdi>{original}</bdi>
                  </p>
                  <p className="text-body-s text-fg-secondary">
                    {t('local')}: <bdi>{local}</bdi>
                  </p>
                  <div className="text-body-s text-fg-secondary">{outcome}</div>
                </section>
              ),
            };
          })}
      />
      {draft.stage === 'review' ? <Alert tone="info" title={t('audit')} /> : null}
    </>
  );
}
