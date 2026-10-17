import { render } from '@dukani/i18n/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Dto } from '@dukani/contracts';
import { DataProvider, createDataClient, useInvalidate } from '@dukani/data';
import { appError, PERMISSIONS } from '@dukani/domain';
import { ActiveStoreProvider, type ActiveStore } from '@dukani/platform';
import type { ReactNode } from 'react';
import type { ReportsRepository } from '../../application/ports';
import { ReportsModuleProvider } from '../../module';
import { AttentionSection } from './AttentionSection';
import { TodayMetricsRow } from './TodayMetricsRow';
import { WeekSalesSection } from './WeekSalesSection';

const STORE: ActiveStore = {
  id: 'store-1',
  name: 'دکان',
  storeTypeKey: 'stationery',
  role: 'Owner',
  permissions: [...PERMISSIONS],
};
const SALES = {
  period: { from: '2026-09-19', to: '2026-09-25' },
  series: [
    { from: '2026-09-19', netAmount: '100000' },
    { from: '2026-09-20', netAmount: '150000' },
  ],
} as unknown as Dto<'SalesReportDto'>;
const offline = () => appError('Offline', 'NETWORK', 'offline');

function RefreshReports() {
  const invalidate = useInvalidate();
  return <button onClick={() => void invalidate([])}>refresh reports</button>;
}

/** First call fails (a partial failure of the home page), the retry succeeds. */
const failOnce = <T,>(value: T) => {
  let calls = 0;
  return vi.fn(async () => {
    calls++;
    if (calls === 1) throw offline();
    return value;
  });
};

const renderHome = (reports: Partial<ReportsRepository>, ui: ReactNode) =>
  render(
    <DataProvider client={createDataClient()}>
      <ActiveStoreProvider value={STORE}>
        <ReportsModuleProvider value={{ reports: reports as ReportsRepository }}>{ui}</ReportsModuleProvider>
      </ActiveStoreProvider>
    </DataProvider>,
  );

describe('home sections on a partial failure (F04 §10)', () => {
  it.each(['chart', 'summary', 'attention'] as const)(
    '%s preserves cached data but reports a failed refresh',
    async (section) => {
      const user = userEvent.setup();
      const value =
        section === 'chart'
          ? SALES
          : section === 'summary'
            ? { netSales: { current: '250000' }, receivedAmount: '40000', lowStockCount: 0 }
            : { byKind: { LowStock: 3 } };
      const read = vi
        .fn()
        .mockResolvedValueOnce(value)
        .mockRejectedValueOnce(offline())
        .mockResolvedValue(value);
      const key = section === 'chart' ? 'sales' : section === 'summary' ? 'summary' : 'actionCounts';
      renderHome(
        { [key]: read },
        <>
          <RefreshReports />
          {section === 'chart' ? (
            <WeekSalesSection />
          ) : section === 'summary' ? (
            <TodayMetricsRow />
          ) : (
            <AttentionSection actions={[]} />
          )}
        </>,
      );
      const dataLabel =
        section === 'chart'
          ? 'فروش (هزار تومان)'
          : section === 'summary'
            ? 'فروش امروز'
            : '۳ کالا نزدیک اتمام';
      expect(await screen.findByText(dataLabel)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'refresh reports' }));
      expect(await screen.findByText('به‌روزرسانی این بخش انجام نشد')).toBeInTheDocument();
      expect(screen.getByText(dataLabel)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
      await screen.findByText(dataLabel);
      expect(read).toHaveBeenCalledTimes(3);
    },
  );
  it('the week chart shows an error with retry instead of vanishing, then its bars and data table (F04-S05)', async () => {
    const user = userEvent.setup();
    const sales = failOnce(SALES);
    renderHome({ sales }, <WeekSalesSection />);
    const chart = (await screen.findByText('فروش این هفته')).closest('figure') as HTMLElement;
    await user.click(await within(chart).findByRole('button', { name: 'تلاش دوباره' }));
    const table = await within(chart).findByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'فروش (هزار تومان)' })).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(3);
    expect(sales).toHaveBeenCalledTimes(2);
  });

  it('today metrics never fall back to zero amounts; retry loads them', async () => {
    const user = userEvent.setup();
    const summary = failOnce({
      netSales: { current: '250000' },
      receivedAmount: '40000',
      lowStockCount: 0,
    } as unknown as Dto<'SummaryDto'>);
    renderHome({ summary }, <TodayMetricsRow />);
    await user.click(await screen.findByRole('button', { name: 'تلاش دوباره' }));
    expect(await screen.findByText('فروش امروز')).toBeInTheDocument();
    expect(screen.queryByText('۰')).not.toBeInTheDocument();
  });

  it('«نیازمند توجه» reports a failed count instead of hiding, and recovers', async () => {
    const user = userEvent.setup();
    const actionCounts = failOnce({ byKind: { LowStock: 3 } } as unknown as Dto<'ActionCountsDto'>);
    renderHome({ actionCounts }, <AttentionSection actions={[]} />);
    expect(await screen.findByText('موارد نیازمند توجه دریافت نشد')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'تلاش دوباره' }));
    expect(await screen.findByText('۳ کالا نزدیک اتمام')).toBeInTheDocument();
  });
});
