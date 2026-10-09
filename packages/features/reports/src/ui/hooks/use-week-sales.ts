'use client';
import { useFormatter, useLocale } from '@dukani/i18n';
import { formatDecimalFa, normalizeDigits, fromDateOnly, type DecimalString } from '@dukani/domain';
import { useReportTranslations } from '../i18n/use-report-translations';
import { useAppQuery } from '@dukani/data';
import { useActiveStore } from '@dukani/platform';
import { weekBars } from '../../domain/home';
import { useReportsModule } from '../../module';
import { reportKeys } from './report-keys';

export const useWeekSales = () => {
  const t = useReportTranslations();
  const formatter = useFormatter();
  const locale = useLocale();
  const amount = (value: DecimalString) =>
    locale === 'fa'
      ? formatDecimalFa(value)
      : normalizeDigits(formatDecimalFa(value)).replaceAll('٬', ',').replaceAll('٫', '.');
  const date = (value: string) =>
    formatter.dateTime(fromDateOnly(value), { calendar: 'persian', day: 'numeric', month: 'long' });
  const { reports } = useReportsModule();
  const store = useActiveStore();
  return useAppQuery({
    queryKey: reportKeys(store.id).custom('sales', 'ThisWeek'),
    queryFn: ({ signal }) => reports.sales(store.id, 'ThisWeek', signal),
    select: (r) => ({
      bars: weekBars(r.series).map((b) => ({
        value: b.value,
        label: formatter.dateTime(fromDateOnly(b.from), { weekday: 'long' }),
        display: amount(b.amount),
      })),
      caption: t('caption', { from: date(r.period.from), to: date(r.period.to) }),
    }),
    staleTime: 5 * 60_000,
  });
};
