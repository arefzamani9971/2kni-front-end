/** Reports feature (scope:seller): home metrics, action counts and sales trend (F05); full reports later. */
export { createReportsModule, ReportsModuleProvider, useReportsModule } from './module';
export { type ReportsModule } from './module.types';
export type { ReportsRepository } from './application/ports';
export { reportKeys } from './ui/hooks/report-keys';
export { useTodayMetrics } from './ui/hooks/use-today-metrics';
export { useAttention } from './ui/hooks/use-attention';
export { useWeekSales } from './ui/hooks/use-week-sales';
export { TodayMetricsRow } from './ui/components/TodayMetricsRow';
export { AttentionSection } from './ui/components/AttentionSection';
export { type AttentionAction } from './ui/components/AttentionSection.types';
export { WeekSalesSection } from './ui/components/WeekSalesSection';
