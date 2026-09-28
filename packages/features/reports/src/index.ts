/** Reports feature (scope:seller): home metrics, action counts and sales trend (F05); full reports later. */
export { createReportsModule, ReportsModuleProvider, useReportsModule, type ReportsModule } from './module';
export type { ReportsRepository } from './application/ports';
export { reportKeys } from './ui/hooks/report-keys';
export { useTodayMetrics } from './ui/hooks/use-today-metrics';
export { useAttention } from './ui/hooks/use-attention';
export { useWeekSales } from './ui/hooks/use-week-sales';
export { TodayMetricsRow } from './ui/components/TodayMetricsRow';
export { AttentionSection, type AttentionAction } from './ui/components/AttentionSection';
export { WeekSalesSection } from './ui/components/WeekSalesSection';
