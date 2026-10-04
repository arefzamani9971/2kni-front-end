import type { Dto } from '@dukani/contracts';
import type { MockDb } from '../db/mock-db.types';
import { route } from '../msw/route';
import { isLowStock } from './dto';
import { str } from '../db/wire';
import { PERIOD_LABELS, SCALE } from './reports.constants';

const delta = (current: number, previous: number): Dto<'DeltaDto'> => ({
  current: str(current),
  previous: str(previous),
  changePercent: str(previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10),
});

const actionsOf = (db: MockDb, storeId: string) => {
  const products = db.state.storeProducts.filter((p) => p.storeId === storeId && p.status === 'Active');
  const byKind: Record<string, number> = {
    LowStock: products.filter((p) => isLowStock(p) && p.onHand - p.reserved > 0).length,
    OutOfStock: products.filter((p) => p.onHand - p.reserved <= 0).length,
    UnknownCost: products.filter((p) => p.costStatus === 'Unknown').length,
    NoPrice: products.filter((p) => p.baseSalePrice === null).length,
    DraftPurchase: db.state.purchases.filter((p) => p.storeId === storeId && p.status === 'Draft').length,
  };
  for (const k of Object.keys(byKind)) if (!byKind[k]) delete byKind[k];
  const open = Object.values(byKind).reduce((s, n) => s + n, 0);
  return { open, critical: byKind.OutOfStock ?? 0, byKind };
};

/** Reporting module: home summary (period switcher) and action counts. */
export const reportHandlers = (db: MockDb) => [
  route.get('/api/v1/stores/{storeId}/reports/summary', ({ request, params, query }) => {
    const { member } = db.requireMember(request, params.storeId);
    // without report.financial the profit figures are hidden (null), never faked as 0 (F04)
    const financial = db.permissionsOf(member).includes('report.financial');
    const period = query.get('period') ?? 'Today';
    const k = SCALE[period] ?? 10;
    const today = new Date().toISOString().slice(0, 10);
    const products = db.state.storeProducts.filter(
      (p) => p.storeId === params.storeId && p.status === 'Active',
    );
    const sales = 1_000_000 * k;
    return {
      period: {
        from: query.get('from') ?? today,
        to: query.get('to') ?? today,
        label: PERIOD_LABELS[period] ?? period,
        compareFrom: null,
        compareTo: null,
      },
      netSales: delta(sales, Math.round(sales * 0.88)),
      invoiceCount: delta(12 * k, 10 * k),
      averageInvoiceAmount: str(Math.round(sales / (12 * k))),
      receivedAmount: str(800_000 * k),
      newCreditAmount: str(200_000 * k),
      financialAvailable: financial,
      grossProfitAmount: financial ? str(Math.round(sales * 0.22)) : null,
      coverage: !financial ? null : {
        costKnownNetAmount: str(Math.round(sales * 0.9)),
        unknownCostNetAmount: str(Math.round(sales * 0.1)),
        coveragePercent: '90',
        unknownCostProductCount: products.filter((p) => p.costStatus === 'Unknown').length,
      },
      totalReceivableAmount: '3450000',
      lowStockCount: products.filter(isLowStock).length,
      openActionCount: actionsOf(db, params.storeId).open,
    };
  }),

  route.get('/api/v1/stores/{storeId}/reports/sales', ({ request, params, query }) => {
    db.requireMember(request, params.storeId);
    const period = query.get('period') ?? 'ThisWeek';
    // Saturday-first week (Iran); six business days like Figma «فروش این هفته»
    const today = new Date();
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - ((today.getDay() + 1) % 7));
    const net = [1_000_000, 1_500_000, 1_800_000, 1_200_000, 2_000_000, 2_500_000];
    const series = net.map((n, i) => {
      const d = new Date(saturday);
      d.setDate(saturday.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      return {
        from: iso,
        to: iso,
        label: iso,
        netAmount: str(n),
        invoiceCount: Math.round(n / 85_000),
        profitAmount: str(Math.round(n * 0.22)),
      };
    });
    const total = net.reduce((a, b) => a + b, 0);
    return {
      period: {
        from: series[0]!.from,
        to: series.at(-1)!.to,
        label: PERIOD_LABELS[period] ?? period,
        compareFrom: null,
        compareTo: null,
      },
      grossAmount: str(total),
      discountAmount: '0',
      netAmount: str(total),
      taxAmount: '0',
      shippingAmount: '0',
      invoiceCount: series.reduce((a, p) => a + p.invoiceCount, 0),
      averageInvoiceAmount: '85000',
      cashSalesAmount: str(Math.round(total * 0.8)),
      creditSalesAmount: str(Math.round(total * 0.2)),
      series,
      compareSeries: null,
    };
  }),

  route.get('/api/v1/stores/{storeId}/actions/counts', ({ request, params }) => {
    db.requireMember(request, params.storeId);
    return actionsOf(db, params.storeId);
  }),
];
