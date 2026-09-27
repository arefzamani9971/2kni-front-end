import type { Dto } from '@dukani/contracts';
import type { PeriodPreset } from '@dukani/domain';

/** Port to the Reporting module (read models only). */
export type ReportsRepository = {
  summary(storeId: string, period: PeriodPreset, signal?: AbortSignal): Promise<Dto<'SummaryDto'>>;
  sales(storeId: string, period: PeriodPreset, signal?: AbortSignal): Promise<Dto<'SalesReportDto'>>;
  actionCounts(storeId: string, signal?: AbortSignal): Promise<Dto<'ActionCountsDto'>>;
};
