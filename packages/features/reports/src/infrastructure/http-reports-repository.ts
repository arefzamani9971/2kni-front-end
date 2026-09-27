import type { Api } from '@dukani/http';
import type { ReportsRepository } from '../application/ports';

export const createHttpReportsRepository = (api: Api): ReportsRepository => ({
  summary: (storeId, period, signal) => api.get('/api/v1/stores/{storeId}/reports/summary', { path: { storeId }, query: { period }, signal }),
  sales: (storeId, period, signal) =>
    api.get('/api/v1/stores/{storeId}/reports/sales', { path: { storeId }, query: { period, groupBy: 'Day' }, signal }),
  actionCounts: (storeId, signal) => api.get('/api/v1/stores/{storeId}/actions/counts', { path: { storeId }, signal }),
});
