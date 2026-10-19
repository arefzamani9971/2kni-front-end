'use client';
import { decimal, money } from '@dukani/domain';
import { Alert, Button, MetricSummary, ListRow, Section, useAppErrorMessage } from '@dukani/ui-kit';
import { useEntryPresentation } from '../common/hooks/use-entry-presentation';
import { useEntryTranslations } from '../i18n/use-entry-translations';
import { bulkWarningCopy } from './BulkPreviewSummary.constants';
import type { BulkPreviewSummaryProps } from './BulkPreviewSummary.types';
export function BulkPreviewSummary({ data, onRefreshRow }: BulkPreviewSummaryProps) {
  const t = useEntryTranslations();
  const presentation = useEntryPresentation();
  const message = useAppErrorMessage();
  const quantities = new Map<string, ReturnType<typeof decimal.of>>();
  for (const row of data.rows) {
    const summary = row.resolvedSummary;
    if (summary?.qtyBase != null)
      quantities.set(
        summary.baseUnitName,
        decimal.add(quantities.get(summary.baseUnitName) ?? decimal.zero, decimal.of(summary.qtyBase)),
      );
  }
  return (
    <>
      <MetricSummary
        label={t('bulk.summary')}
        avatarLabel={t('bulk.summary').slice(0, 1)}
        description={t('bulk.atomicHint')}
        metrics={[
          {
            id: 'rows',
            text: t('bulk.rowCount', { count: data.validCount }),
            icon: 'check-circle',
            tone: 'brand',
          },
          {
            id: 'quantity',
            text:
              [...quantities].map(([name, value]) => presentation.qty(value) + ' ' + name).join(' · ') ||
              t('noStockHint'),
            icon: 'products',
          },
          {
            id: 'total',
            text:
              t('bulk.total') +
              ': ' +
              (data.receiptTotals.amount != null
                ? presentation.money(money(data.receiptTotals.amount))
                : t('lookup.unknownValue')),
            icon: 'receipt',
            tone: 'warning',
          },
        ]}
      />
      {data.rows
        .filter((row) => row.errors.length || row.warnings.length)
        .map((row) => (
          <Section
            key={row.clientRowId}
            title={row.resolvedSummary?.title ?? t('bulk.rowLabel', { index: row.rowIndex + 1 })}
          >
            <ListRow>
              {row.resolvedSummary?.qtyBase != null
                ? presentation.qty(row.resolvedSummary.qtyBase)
                : t('lookup.unknownValue')}{' '}
              {row.resolvedSummary?.baseUnitName}
            </ListRow>
            {row.errors.map((error, index) => (
              <Alert
                key={index}
                tone="danger"
                title={
                  error.code === 'BULK_ROW_STALE'
                    ? t('bulk.stale')
                    : message({ kind: 'Validation', code: error.code, message: '' })
                }
              />
            ))}
            {row.errors.some((error) => error.code === 'BULK_ROW_STALE') && onRefreshRow ? (
              <Button variant="secondary" onClick={() => onRefreshRow(row.clientRowId)}>
                {t('bulk.refreshRow')}
              </Button>
            ) : null}
            {row.warnings.map((warning, index) => (
              <Alert
                key={index}
                tone="warning"
                title={t('bulk.warning')}
                description={t(
                  bulkWarningCopy[warning.code as keyof typeof bulkWarningCopy] ?? 'bulk.warning',
                )}
              />
            ))}
          </Section>
        ))}
    </>
  );
}
