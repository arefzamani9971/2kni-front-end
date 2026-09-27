/** Reports feature (scope:seller): home metrics, action counts and sales trend (F05); full reports later. */
export { createReportsModule, ReportsModuleProvider, useReportsModule, type ReportsModule } from './module';
export type { ReportsRepository } from './application/ports';
export { reportKeys, useTodayMetrics, useAttention, useWeekSales } from './ui/hooks/use-home';
export { TodayMetricsRow, AttentionSection, WeekSalesSection, type AttentionAction } from './ui/components/HomeSections';
