'use client';
import { formatMoney, MONEY_UNIT_LABEL } from '@dukani/domain';
import { ButtonLink, ListRow, MetricCard, MiniBarChart, PageState, Section, Skeleton } from '@dukani/ui-kit';
import { useAttention, useTodayMetrics, useWeekSales } from '../hooks/use-home';

/** Metrics row (Figma home «Metrics»): in RTL «دریافت امروز» is first, like the frame. */
export function TodayMetricsRow() {
  const q = useTodayMetrics();
  if (q.isPending)
    return (
      <div className="flex gap-3">
        <Skeleton className="h-36 flex-1 rounded-lg" />
        <Skeleton className="h-36 flex-1 rounded-lg" />
      </div>
    );
  if (!q.data) return <PageState kind="error" description={q.error?.message} />;
  return (
    <div className="flex gap-3">
      <MetricCard label="دریافت امروز" value={formatMoney(q.data.received, { unit: false })} unit={MONEY_UNIT_LABEL} />
      <MetricCard label="فروش امروز" value={formatMoney(q.data.sales, { unit: false })} unit={MONEY_UNIT_LABEL} />
    </div>
  );
}

export type AttentionAction = { readonly kind: string; readonly label: string; readonly href: string };

/** «نیازمند توجه»: counts from the action center + the matching fixes (hidden when nothing is open). */
export function AttentionSection({ actions }: { actions: readonly AttentionAction[] }) {
  const q = useAttention();
  if (!q.data || q.data.length === 0) return null;
  const kinds = new Set(q.data.map((i) => i.kind));
  const fixes = actions.filter((a) => kinds.has(a.kind));
  return (
    <Section title="نیازمند توجه">
      {q.data.map((i) => (
        <ListRow key={i.kind}>{i.label}</ListRow>
      ))}
      {fixes.map((a) => (
        <ButtonLink key={a.kind} href={a.href}>
          {a.label}
        </ButtonLink>
      ))}
    </Section>
  );
}

/** «فروش این هفته» bar chart in thousand toman. */
export function WeekSalesSection() {
  const q = useWeekSales();
  if (!q.data) return q.isPending ? <Skeleton className="h-72 w-full rounded-md" /> : null;
  return (
    <Section title="فروش این هفته" description={q.data.caption}>
      <MiniBarChart label="روند فروش / هزار تومان" data={q.data.bars} height={180} />
    </Section>
  );
}
