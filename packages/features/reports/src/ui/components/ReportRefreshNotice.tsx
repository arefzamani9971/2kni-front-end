'use client';
import { Alert, Button } from '@dukani/ui-kit';
import { useReportTranslations } from '../i18n/use-report-translations';
import type { ReportRefreshNoticeProps } from './ReportRefreshNotice.types';

/** Cached values remain useful on a transient refresh failure, but must not look freshly confirmed. */
export function ReportRefreshNotice({ failed, refreshing, onRetry }: ReportRefreshNoticeProps) {
  const t = useReportTranslations();
  if (!failed) return null;
  return (
    <Alert
      tone="warning"
      title={t('refreshFailed')}
      description={t('previousData')}
      action={
        <Button variant="secondary" size="sm" loading={refreshing} onClick={onRetry}>
          {t('retry')}
        </Button>
      }
    />
  );
}
