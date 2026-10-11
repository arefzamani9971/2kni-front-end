'use client';
import { createAdaptive } from '../responsive/adaptive';
import type { MetricSummaryProps } from './MetricSummary.types';
import { MetricSummaryTiles } from './MetricSummaryTiles';
import { MetricSummaryCard } from './MetricSummaryCard';

/** Figma bulk review 358:500/5363: one summary card on mobile, three metrics on desktop. */
export const MetricSummary = createAdaptive<MetricSummaryProps>('MetricSummary', {
  mobile: MetricSummaryCard,
  desktop: MetricSummaryTiles,
});
